import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import mongoose from "mongoose";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { EscrowLedgerEntryModel } = await import("../models/index.js");
const {
  buildEscrowAmountsForShipment,
  markEscrowReleasable,
  openEscrowForPaidOrder,
  scheduleEscrowAutoRelease,
} = await import("../services/payments/escrowLedger.js");
const { processEscrowReleaseCronTasks } = await import(
  "../services/payments/escrowReleaseCron.js"
);
const { ESCROW_AUTO_RELEASE_MS } = await import("../constants/escrowConstants.js");

const SELLER = new mongoose.Types.ObjectId();
const OTHER_SELLER = new mongoose.Types.ObjectId();
const BUYER = new mongoose.Types.ObjectId();

/** @param {Record<string, unknown>} [overrides] */
const buildOrder = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  userBuyerId: BUYER,
  items: [
    {
      sellerIdAtOrder: SELLER,
      unitPriceAtOrder: 500,
      quantity: 2,
    },
  ],
  shipments: [
    {
      sellerId: SELLER,
      sellerDeliveryFeeRub: 200,
      platformCommissionPercentAtOrder: 2,
    },
  ],
  ...overrides,
});

/** @param {unknown} orderId */
const readEntry = (orderId, sellerId = SELLER) =>
  EscrowLedgerEntryModel.findOne({ orderId, sellerId }).lean();

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("суммы эскроу по отправлению", () => {
  it("товары продавца плюс его доставка, комиссия только с товаров", () => {
    const amounts = buildEscrowAmountsForShipment(buildOrder(), String(SELLER));

    assert.equal(amounts.goodsRub, 1000);
    assert.equal(amounts.deliveryRub, 200);
    assert.equal(amounts.commissionRub, 20);
    assert.equal(amounts.sellerRub, 1180);
    assert.equal(amounts.totalRub, 1200);
  });

  it("чужие позиции в сумму не попадают", () => {
    const order = buildOrder({
      items: [
        { sellerIdAtOrder: SELLER, unitPriceAtOrder: 500, quantity: 1 },
        { sellerIdAtOrder: OTHER_SELLER, unitPriceAtOrder: 9000, quantity: 1 },
      ],
    });

    assert.equal(buildEscrowAmountsForShipment(order, String(SELLER)).goodsRub, 500);
  });

  it("бесплатные единицы «N+1» покупатель не оплачивал", () => {
    const order = buildOrder({
      items: [
        {
          sellerIdAtOrder: SELLER,
          unitPriceAtOrder: 500,
          quantity: 3,
          buyNFreeUnitsAtOrder: 1,
        },
      ],
    });

    assert.equal(buildEscrowAmountsForShipment(order, String(SELLER)).goodsRub, 1000);
  });

  it("курьерская подача в эскроу не попадает", () => {
    const order = buildOrder({
      shipments: [
        {
          sellerId: SELLER,
          deliveryFeeRub: 300,
          sellerDeliveryFeeRub: 0,
          platformCommissionPercentAtOrder: 2,
        },
      ],
    });

    assert.equal(
      buildEscrowAmountsForShipment(order, String(SELLER)).deliveryRub,
      0,
      "те деньги покупатель отдаёт курьеру в руки, площадка их не проводит",
    );
  });
});

describe("открытие эскроу", () => {
  it("создаёт запись в состоянии held", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });

    const entry = await readEntry(order._id);
    assert.equal(entry.state, "held");
    assert.equal(entry.totalRub, 1200);
    assert.equal(entry.commissionRub, 20);
    assert.equal(entry.sellerRub, 1180);
    assert.equal(entry.releaseDueAt, null, "отсчёт идёт от вручения, а не от оплаты");
  });

  it("повторный вебхук не создаёт вторую запись", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await openEscrowForPaidOrder({ order });

    const count = await EscrowLedgerEntryModel.countDocuments({ orderId: order._id });
    assert.equal(count, 1, "иначе выплата ушла бы дважды");
  });

  it("на каждого продавца своя запись", async () => {
    const order = buildOrder({
      items: [
        { sellerIdAtOrder: SELLER, unitPriceAtOrder: 500, quantity: 1 },
        { sellerIdAtOrder: OTHER_SELLER, unitPriceAtOrder: 700, quantity: 1 },
      ],
      shipments: [
        { sellerId: SELLER, sellerDeliveryFeeRub: 0, platformCommissionPercentAtOrder: 2 },
        { sellerId: OTHER_SELLER, sellerDeliveryFeeRub: 0, platformCommissionPercentAtOrder: 2 },
      ],
    });

    await openEscrowForPaidOrder({ order });

    assert.equal(await EscrowLedgerEntryModel.countDocuments({ orderId: order._id }), 2);
    assert.equal((await readEntry(order._id, OTHER_SELLER)).goodsRub, 700);
  });
});

describe("разморозка", () => {
  it("вручение запускает отсчёт на неделю", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    const deliveredAt = new Date("2026-09-01T10:00:00.000Z");

    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      deliveredAt,
    });

    const entry = await readEntry(order._id);
    assert.equal(
      entry.releaseDueAt.getTime(),
      deliveredAt.getTime() + ESCROW_AUTO_RELEASE_MS,
    );
  });

  it("повторное вручение не отодвигает срок", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    const first = new Date("2026-09-01T10:00:00.000Z");
    await scheduleEscrowAutoRelease({ orderId: order._id, sellerId: SELLER, deliveredAt: first });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      deliveredAt: new Date("2026-09-05T10:00:00.000Z"),
    });

    const entry = await readEntry(order._id);
    assert.equal(
      entry.releaseDueAt.getTime(),
      first.getTime() + ESCROW_AUTO_RELEASE_MS,
      "иначе продавец отодвигал бы себе выплату каждым нажатием",
    );
  });

  it("подтверждение покупателя размораживает сразу", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });

    const updated = await markEscrowReleasable({ orderId: order._id, sellerId: SELLER });

    assert.equal(updated.state, "releasable");
    assert.equal(updated.releaseReason, "buyer_confirmed");
    assert.ok(updated.releasableAt);
  });

  it("повторная разморозка ничего не меняет", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await markEscrowReleasable({ orderId: order._id, sellerId: SELLER });

    const second = await markEscrowReleasable({ orderId: order._id, sellerId: SELLER });

    assert.equal(second, null, "фильтр по held — это и есть защита от гонки");
    assert.equal((await readEntry(order._id)).releaseReason, "buyer_confirmed");
  });
});

describe("автоматическая разморозка по сроку", () => {
  it("размораживает то, у чего срок вышел", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      deliveredAt: new Date(Date.now() - ESCROW_AUTO_RELEASE_MS - 1000),
    });

    const result = await processEscrowReleaseCronTasks();

    assert.equal(result.released, 1);
    const entry = await readEntry(order._id);
    assert.equal(entry.state, "releasable");
    assert.equal(entry.releaseReason, "auto_release_timeout");
  });

  it("не трогает то, у чего срок не вышел", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      deliveredAt: new Date(),
    });

    assert.equal((await processEscrowReleaseCronTasks()).released, 0);
    assert.equal((await readEntry(order._id)).state, "held");
  });

  it("не трогает невручённое: без вручения платить не за что", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });

    assert.equal((await processEscrowReleaseCronTasks()).released, 0);
    assert.equal((await readEntry(order._id)).state, "held");
  });
});
