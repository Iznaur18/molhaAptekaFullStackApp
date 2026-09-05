import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const mongoose = (await import("mongoose")).default;
const {
  buildOrderShipments,
  buildStoredShipments,
  groupOrderItemsBySellerId,
  resolveShipmentFulfillment,
} = await import("../services/order/orderShipments.js");

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { up: shipmentsMigrationUp } = await import(
  "../scripts/migrations/20260831-order-shipments.js"
);
/**
 * Импорт нужен ради регистрации коллекции: `clearMongoCollections` чистит
 * только то, о чём знает mongoose, а вставляем мы сырым драйвером.
 */
await import("../models/index.js");

const SELLER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const SELLER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

/** @param {string | null} sellerId @param {string} status */
const line = (sellerId, status = "pending") => ({
  sellerIdAtOrder: sellerId,
  status,
});

describe("группировка позиций в отправления", () => {
  it("разносит позиции двух продавцов по разным отправлениям", () => {
    const grouped = groupOrderItemsBySellerId([
      line(SELLER_A),
      line(SELLER_B),
      line(SELLER_A),
    ]);

    assert.equal(grouped.size, 2);
    assert.deepEqual(grouped.get(SELLER_A).itemIndexes, [0, 2]);
    assert.deepEqual(grouped.get(SELLER_B).itemIndexes, [1]);
  });

  it("складывает позиции без продавца в отдельную корзину", () => {
    const grouped = groupOrderItemsBySellerId([line(SELLER_A), line(null)]);

    assert.equal(grouped.size, 2);
    assert.equal(grouped.get("").sellerId, null, "осиротевшая позиция не теряется");
  });

  it("пустой заказ даёт пустую группировку", () => {
    assert.equal(groupOrderItemsBySellerId([]).size, 0);
    assert.equal(groupOrderItemsBySellerId(null).size, 0);
  });
});

describe("способ получения отправления", () => {
  it("берёт сохранённый на отправлении", () => {
    const order = {
      fulfillmentMethod: "pickup",
      shipments: [{ sellerId: SELLER_A, fulfillmentMethod: "delivery" }],
    };

    assert.equal(resolveShipmentFulfillment(order, SELLER_A), "delivery");
  });

  it("падает на общий у заказов до отправлений", () => {
    const order = { fulfillmentMethod: "delivery", shipments: [] };

    assert.equal(
      resolveShipmentFulfillment(order, SELLER_A),
      "delivery",
      "старый заказ читается по общему способу",
    );
  });

  it("неизвестное значение считает самовывозом", () => {
    assert.equal(resolveShipmentFulfillment({ fulfillmentMethod: "wat" }, SELLER_A), "pickup");
    assert.equal(resolveShipmentFulfillment({}, null), "pickup");
  });

  it("не путает отправления разных продавцов", () => {
    const order = {
      fulfillmentMethod: "pickup",
      shipments: [
        { sellerId: SELLER_A, fulfillmentMethod: "delivery" },
        { sellerId: SELLER_B, fulfillmentMethod: "pickup" },
      ],
    };

    assert.equal(resolveShipmentFulfillment(order, SELLER_A), "delivery");
    assert.equal(resolveShipmentFulfillment(order, SELLER_B), "pickup");
  });
});

describe("статус отправления", () => {
  it("считается по позициям своего продавца, а не всего заказа", () => {
    const order = {
      fulfillmentMethod: "pickup",
      shipments: [],
      items: [
        line(SELLER_A, "shipped"),
        line(SELLER_B, "pending"),
        line(SELLER_A, "shipped"),
      ],
    };

    const shipments = buildOrderShipments(order);
    const byId = Object.fromEntries(shipments.map((s) => [s.sellerId, s.status]));

    assert.equal(byId[SELLER_A], "shipped", "продавец А своё отправил");
    assert.equal(byId[SELLER_B], "pending", "продавец Б ещё не тронул своё");
  });

  it("возврат одной позиции не роняет отправление целиком", () => {
    const order = {
      items: [line(SELLER_A, "returned"), line(SELLER_A, "shipped")],
    };

    assert.equal(buildOrderShipments(order)[0].status, "pending");
  });

  it("отдаёт номера позиций для действий продавца", () => {
    const order = {
      items: [line(SELLER_B), line(SELLER_A), line(SELLER_A)],
    };

    const shipmentA = buildOrderShipments(order).find((s) => s.sellerId === SELLER_A);
    assert.deepEqual(shipmentA.itemIndexes, [1, 2]);
  });
});

describe("хранимая часть отправлений", () => {
  it("по одному отправлению на продавца", () => {
    const stored = buildStoredShipments(
      [line(SELLER_A), line(SELLER_B), line(SELLER_A)],
      { fallbackFulfillment: "delivery" },
    );

    assert.equal(stored.length, 2);
    assert.ok(stored.every((row) => row.fulfillmentMethod === "delivery"));
  });

  it("разрешает разный способ получения у разных продавцов", () => {
    const stored = buildStoredShipments([line(SELLER_A), line(SELLER_B)], {
      fulfillmentBySellerId: { [SELLER_A]: "delivery", [SELLER_B]: "pickup" },
    });

    const byId = Object.fromEntries(
      stored.map((row) => [row.sellerId, row.fulfillmentMethod]),
    );
    assert.equal(byId[SELLER_A], "delivery");
    assert.equal(byId[SELLER_B], "pickup");
  });

  it("позиции без продавца отправления не создают", () => {
    assert.deepEqual(buildStoredShipments([line(null)], {}), []);
  });
});

describe("миграция orders.shipments", () => {
  const up = shipmentsMigrationUp;
  const db = () => mongoose.connection.db;

  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** @param {{ sellerIds: unknown[]; fulfillmentMethod?: string }} params */
  async function insertOrder({ sellerIds, fulfillmentMethod = "pickup" }) {
    const { insertedId } = await db()
      .collection("orders")
      .insertOne({
        userBuyerId: new mongoose.Types.ObjectId(),
        items: sellerIds.map((sellerId) => ({
          productId: new mongoose.Types.ObjectId(),
          quantity: 1,
          unitPriceAtOrder: 100,
          productNameAtOrder: "Товар",
          sellerIdAtOrder: sellerId,
          status: "pending",
        })),
        totalAmount: 100 * sellerIds.length,
        deliveryAddress: "Тестовый адрес",
        fulfillmentMethod,
        paymentMethod: "cashOnDelivery",
        status: "pending",
      });
    return insertedId;
  }

  it("собирает по отправлению на каждого продавца", async () => {
    const sellerA = new mongoose.Types.ObjectId();
    const sellerB = new mongoose.Types.ObjectId();
    const orderId = await insertOrder({
      sellerIds: [sellerA, sellerB, sellerA],
      fulfillmentMethod: "delivery",
    });

    const result = await up({ db: db(), isApply: true });
    assert.equal(result.modified, 1);

    const fresh = await db().collection("orders").findOne({ _id: orderId });
    assert.equal(fresh.shipments.length, 2, "три позиции, но два продавца");
    assert.ok(
      fresh.shipments.every((row) => row.fulfillmentMethod === "delivery"),
      "старый общий способ разнесён по отправлениям как есть",
    );
  });

  it("пропускает заказ, у которого продавца нет ни в одной позиции", async () => {
    await insertOrder({ sellerIds: [null] });

    const result = await up({ db: db(), isApply: true });

    assert.equal(result.skippedWithoutSeller, 1);
    assert.equal(result.modified, 0);
  });

  it("повторный прогон ничего не меняет", async () => {
    await insertOrder({ sellerIds: [new mongoose.Types.ObjectId()] });
    await up({ db: db(), isApply: true });

    const second = await up({ db: db(), isApply: true });

    assert.equal(second.matched, 0, "заказ уже с отправлениями под миграцию не попадает");
  });

  it("dry-run не пишет", async () => {
    const orderId = await insertOrder({ sellerIds: [new mongoose.Types.ObjectId()] });

    const result = await up({ db: db(), isApply: false });

    assert.equal(result.wouldMigrate, 1);
    const raw = await db().collection("orders").findOne({ _id: orderId });
    assert.equal(raw.shipments, undefined);
  });
});
