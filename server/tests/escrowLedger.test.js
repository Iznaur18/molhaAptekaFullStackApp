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
  findEscrowLinesDueForRelease,
  markEscrowLineRefundable,
  markEscrowLineReleasable,
  openEscrowForPaidOrder,
  scheduleEscrowAutoRelease,
  summarizeEscrowState,
} = await import("../services/payments/escrowLedger.js");
const { processEscrowReleaseCronTasks } = await import(
  "../services/payments/escrowReleaseCron.js"
);
const {
  ESCROW_AUTO_RELEASE_MS,
  ESCROW_REFUND_REASON_ITEM_CANCELLED,
  ESCROW_REFUND_REASON_ITEM_RETURNED,
} = await import("../constants/escrowConstants.js");

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

/**
 * Заказ из двух позиций одного продавца — та самая ситуация, в которой
 * разморозка «всей записи» отдавала продавцу деньги за неотгруженное.
 */
const buildTwoItemOrder = (deliveryRub = 200) => ({
  _id: new mongoose.Types.ObjectId(),
  userBuyerId: BUYER,
  items: [
    { sellerIdAtOrder: SELLER, unitPriceAtOrder: 500, quantity: 1 },
    { sellerIdAtOrder: SELLER, unitPriceAtOrder: 700, quantity: 1 },
  ],
  shipments: [
    {
      sellerId: SELLER,
      sellerDeliveryFeeRub: deliveryRub,
      platformCommissionPercentAtOrder: 2,
    },
  ],
});

/** @param {unknown} orderId */
const readEntry = (orderId, sellerId = SELLER) =>
  EscrowLedgerEntryModel.findOne({ orderId, sellerId }).lean();

/** @param {Record<string, any>} entry */
const goodsLine = (entry, itemIndex) =>
  entry.lines.find((line) => line.kind === "goods" && line.itemIndex === itemIndex);

/** @param {Record<string, any>} entry */
const deliveryLine = (entry) => entry.lines.find((line) => line.kind === "delivery");

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

  it("строка на позицию и одна на доставку", () => {
    const { lines } = buildEscrowAmountsForShipment(buildTwoItemOrder(), String(SELLER));

    assert.deepEqual(
      lines.map((line) => [line.kind, line.itemIndex, line.totalRub]),
      [
        ["goods", 0, 500],
        ["goods", 1, 700],
        ["delivery", null, 200],
      ],
    );
  });

  it("комиссия и доля продавца сходятся на каждой строке", () => {
    const { lines, totalRub, commissionRub, sellerRub } = buildEscrowAmountsForShipment(
      buildTwoItemOrder(),
      String(SELLER),
    );

    for (const line of lines) {
      assert.equal(
        line.commissionRub + line.sellerRub,
        line.totalRub,
        `строка ${line.kind}/${line.itemIndex} не сходится`,
      );
    }
    assert.equal(commissionRub + sellerRub, totalRub);
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
    assert.equal(
      goodsLine(entry, 0).releaseDueAt,
      null,
      "отсчёт идёт от вручения, а не от оплаты",
    );
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
        {
          sellerId: SELLER,
          sellerDeliveryFeeRub: 0,
          platformCommissionPercentAtOrder: 2,
        },
        {
          sellerId: OTHER_SELLER,
          sellerDeliveryFeeRub: 0,
          platformCommissionPercentAtOrder: 2,
        },
      ],
    });

    await openEscrowForPaidOrder({ order });

    assert.equal(await EscrowLedgerEntryModel.countDocuments({ orderId: order._id }), 2);
    assert.equal((await readEntry(order._id, OTHER_SELLER)).goodsRub, 700);
  });

  it("индекс строки — это индекс позиции в заказе, а не порядок среди своих", async () => {
    const order = buildOrder({
      items: [
        { sellerIdAtOrder: OTHER_SELLER, unitPriceAtOrder: 900, quantity: 1 },
        { sellerIdAtOrder: SELLER, unitPriceAtOrder: 500, quantity: 1 },
      ],
      shipments: [
        {
          sellerId: SELLER,
          sellerDeliveryFeeRub: 0,
          platformCommissionPercentAtOrder: 2,
        },
      ],
    });

    await openEscrowForPaidOrder({ order });

    const entry = await readEntry(order._id);
    assert.equal(
      goodsLine(entry, 1).totalRub,
      500,
      "иначе разморозка попадала бы не в ту позицию",
    );
  });

  it("позиция, отменённая до оплаты, сразу числится долгом перед покупателем", async () => {
    const order = buildOrder({
      items: [
        { sellerIdAtOrder: SELLER, unitPriceAtOrder: 500, quantity: 1 },
        {
          sellerIdAtOrder: SELLER,
          unitPriceAtOrder: 700,
          quantity: 1,
          status: "cancelled",
        },
      ],
    });

    await openEscrowForPaidOrder({ order });

    const entry = await readEntry(order._id);
    assert.equal(goodsLine(entry, 1).state, "refundable");
    assert.equal(goodsLine(entry, 1).refundReason, ESCROW_REFUND_REASON_ITEM_CANCELLED);
    assert.equal(
      entry.totalRub,
      1400,
      "деньги за неё покупатель внёс — строку нельзя просто выкинуть",
    );
  });
});

describe("разморозка по позициям", () => {
  it("вручение запускает отсчёт на неделю", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    const deliveredAt = new Date("2026-09-01T10:00:00.000Z");

    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt,
    });

    const entry = await readEntry(order._id);
    assert.equal(
      goodsLine(entry, 0).releaseDueAt.getTime(),
      deliveredAt.getTime() + ESCROW_AUTO_RELEASE_MS,
    );
  });

  it("повторное вручение не отодвигает срок", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    const first = new Date("2026-09-01T10:00:00.000Z");
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt: first,
    });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt: new Date("2026-09-05T10:00:00.000Z"),
    });

    const entry = await readEntry(order._id);
    assert.equal(
      goodsLine(entry, 0).releaseDueAt.getTime(),
      first.getTime() + ESCROW_AUTO_RELEASE_MS,
      "иначе продавец отодвигал бы себе выплату каждым нажатием",
    );
  });

  it("вручение одной позиции не заводит часы соседней", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });

    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt: new Date("2026-09-01T10:00:00.000Z"),
    });

    const entry = await readEntry(order._id);
    assert.ok(goodsLine(entry, 0).releaseDueAt);
    assert.equal(
      goodsLine(entry, 1).releaseDueAt,
      null,
      "вторая позиция ещё не доехала — её срок не идёт",
    );
  });

  it("подтверждение покупателя размораживает сразу", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });

    const updated = await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });

    assert.equal(updated.state, "releasable");
    const line = goodsLine(updated, 0);
    assert.equal(line.state, "releasable");
    assert.equal(line.releaseReason, "buyer_confirmed");
    assert.ok(line.releasableAt);
  });

  it("подтверждение одной позиции не отдаёт деньги за соседнюю", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });

    await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });

    const entry = await readEntry(order._id);
    assert.equal(goodsLine(entry, 0).state, "releasable");
    assert.equal(
      goodsLine(entry, 1).state,
      "held",
      "вторая позиция ещё едет — деньги за неё продавцу не принадлежат",
    );
    assert.equal(entry.state, "held", "сводка показывает самое незакрытое состояние");
  });

  it("повторная разморозка ничего не меняет", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });

    const second = await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });

    assert.equal(second, null, "фильтр по held — это и есть защита от гонки");
    assert.equal(goodsLine(await readEntry(order._id), 0).releaseReason, "buyer_confirmed");
  });
});

describe("отмена и возврат позиции", () => {
  it("отменённая позиция становится долгом перед покупателем", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });

    await markEscrowLineRefundable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 1,
      reason: ESCROW_REFUND_REASON_ITEM_CANCELLED,
    });

    const entry = await readEntry(order._id);
    assert.equal(goodsLine(entry, 1).state, "refundable");
    assert.equal(goodsLine(entry, 1).refundReason, ESCROW_REFUND_REASON_ITEM_CANCELLED);
    assert.equal(goodsLine(entry, 0).state, "held", "соседнюю позицию отмена не трогает");
  });

  it("возврат снимает отсчёт до автоматической выплаты", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt: new Date(Date.now() - ESCROW_AUTO_RELEASE_MS - 1000),
    });

    await markEscrowLineRefundable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      reason: ESCROW_REFUND_REASON_ITEM_RETURNED,
    });

    const entry = await readEntry(order._id);
    assert.equal(goodsLine(entry, 0).releaseDueAt, null);
    assert.equal(
      (await processEscrowReleaseCronTasks()).released,
      0,
      "иначе просроченный таймер выплатил бы за возвращённый товар",
    );
  });

  it("размороженную позицию отменой уже не забрать", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });

    const result = await markEscrowLineRefundable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      reason: ESCROW_REFUND_REASON_ITEM_RETURNED,
    });

    assert.equal(result, null);
    assert.equal(goodsLine(await readEntry(order._id), 0).state, "releasable");
  });
});

describe("доставка продавца", () => {
  it("остаётся продавцу, как только доехала первая позиция", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });

    await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });

    const entry = await readEntry(order._id);
    assert.equal(deliveryLine(entry).state, "releasable");
    assert.equal(deliveryLine(entry).releaseReason, "shipment_delivered");
  });

  it("возвращается покупателю, если продавец никуда не ездил", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });

    await markEscrowLineRefundable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      reason: ESCROW_REFUND_REASON_ITEM_CANCELLED,
    });
    assert.equal(
      deliveryLine(await readEntry(order._id)).state,
      "held",
      "вторая позиция ещё может доехать — решать рано",
    );

    await markEscrowLineRefundable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 1,
      reason: ESCROW_REFUND_REASON_ITEM_CANCELLED,
    });

    const entry = await readEntry(order._id);
    assert.equal(deliveryLine(entry).state, "refundable");
    assert.equal(deliveryLine(entry).refundReason, "shipment_undelivered");
    assert.equal(entry.state, "refundable");
  });

  it("остаётся продавцу, если хоть что-то доехало, а остальное вернули", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });

    await markEscrowLineReleasable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
    });
    await markEscrowLineRefundable({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 1,
      reason: ESCROW_REFUND_REASON_ITEM_RETURNED,
    });

    const entry = await readEntry(order._id);
    assert.equal(
      deliveryLine(entry).state,
      "releasable",
      "бензин продавцу никто не вернёт",
    );
  });
});

describe("сводное состояние записи", () => {
  it("показывает самое незакрытое состояние среди строк", () => {
    assert.equal(
      summarizeEscrowState([{ state: "releasable" }, { state: "held" }]),
      "held",
    );
    assert.equal(
      summarizeEscrowState([{ state: "releasable" }, { state: "refundable" }]),
      "releasable",
    );
    assert.equal(summarizeEscrowState([{ state: "refunded" }]), "refunded");
  });
});

describe("автоматическая разморозка по сроку", () => {
  it("размораживает то, у чего срок вышел", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt: new Date(Date.now() - ESCROW_AUTO_RELEASE_MS - 1000),
    });

    const result = await processEscrowReleaseCronTasks();

    assert.equal(result.released, 1);
    const entry = await readEntry(order._id);
    assert.equal(entry.state, "releasable");
    assert.equal(goodsLine(entry, 0).releaseReason, "auto_release_timeout");
  });

  it("не трогает то, у чего срок не вышел", async () => {
    const order = buildOrder();
    await openEscrowForPaidOrder({ order });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
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

  it("просроченная позиция не тянет за собой соседнюю", async () => {
    const order = buildTwoItemOrder();
    await openEscrowForPaidOrder({ order });
    await scheduleEscrowAutoRelease({
      orderId: order._id,
      sellerId: SELLER,
      itemIndex: 0,
      deliveredAt: new Date(Date.now() - ESCROW_AUTO_RELEASE_MS - 1000),
    });

    const due = await findEscrowLinesDueForRelease();
    assert.equal(due.length, 1);
    assert.equal(due[0].itemIndex, 0);

    assert.equal((await processEscrowReleaseCronTasks()).released, 1);
    const entry = await readEntry(order._id);
    assert.equal(goodsLine(entry, 0).state, "releasable");
    assert.equal(goodsLine(entry, 1).state, "held");
  });
});
