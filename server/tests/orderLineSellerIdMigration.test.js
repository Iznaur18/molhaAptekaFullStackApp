import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const mongoose = (await import("mongoose")).default;
const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture } = await import(
  "./helpers/orderLoyaltyTestHelpers.js"
);
const { OrderModel } = await import("../models/index.js");
const { up } = await import("../scripts/migrations/20260831-order-line-seller-id.js");

const db = () => mongoose.connection.db;

/**
 * Заказ без `sellerIdAtOrder` — так выглядят все документы до миграции.
 * Пишем сырым драйвером: схема подставила бы `null`, но нам нужно и
 * состояние «поля вообще нет».
 *
 * @param {{ buyerId: unknown; lines: Array<{ productId: unknown; name?: string }> }} params
 */
async function insertLegacyOrder({ buyerId, lines }) {
  const { insertedId } = await db()
    .collection("orders")
    .insertOne({
      userBuyerId: buyerId,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: 1,
        unitPriceAtOrder: 100,
        productNameAtOrder: line.name ?? "Товар",
        status: "pending",
      })),
      totalAmount: 100 * lines.length,
      deliveryAddress: "Тестовый адрес",
      deliveryAddressFlat: "1",
      fulfillmentMethod: "pickup",
      paymentMethod: "cashOnDelivery",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  return insertedId;
}

describe("миграция sellerIdAtOrder", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("проставляет продавца в позиции из товара", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const orderId = await insertLegacyOrder({
      buyerId: buyer._id,
      lines: [{ productId: product._id }],
    });

    const result = await up({ db: db(), isApply: true });

    assert.equal(result.matched, 1);
    assert.equal(result.modified, 1);

    const fresh = await OrderModel.findById(orderId).lean();
    assert.equal(
      String(fresh.items[0].sellerIdAtOrder),
      String(seller._id),
      "продавец переехал в позицию заказа",
    );
  });

  it("разносит разных продавцов по своим позициям", async () => {
    const first = await createOrderLoyaltyFixture();
    const second = await createOrderLoyaltyFixture();

    const orderId = await insertLegacyOrder({
      buyerId: first.buyer._id,
      lines: [
        { productId: first.product._id, name: "Товар А" },
        { productId: second.product._id, name: "Товар Б" },
      ],
    });

    await up({ db: db(), isApply: true });

    const fresh = await OrderModel.findById(orderId).lean();
    assert.equal(String(fresh.items[0].sellerIdAtOrder), String(first.seller._id));
    assert.equal(String(fresh.items[1].sellerIdAtOrder), String(second.seller._id));
    assert.notEqual(
      String(fresh.items[0].sellerIdAtOrder),
      String(fresh.items[1].sellerIdAtOrder),
      "позиции не слиплись в одного продавца",
    );
  });

  it("не трогает уже заполненные позиции", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const other = await createOrderLoyaltyFixture();

    const orderId = await insertLegacyOrder({
      buyerId: buyer._id,
      lines: [{ productId: product._id }],
    });
    await db()
      .collection("orders")
      .updateOne(
        { _id: orderId },
        { $set: { "items.0.sellerIdAtOrder": other.seller._id } },
      );

    const result = await up({ db: db(), isApply: true });

    assert.equal(result.matched, 0, "заполненный заказ под миграцию не попадает");

    const fresh = await OrderModel.findById(orderId).lean();
    assert.equal(
      String(fresh.items[0].sellerIdAtOrder),
      String(other.seller._id),
      "чужое значение не перезаписано",
    );
    assert.notEqual(String(fresh.items[0].sellerIdAtOrder), String(seller._id));
  });

  it("переживает позицию с удалённым товаром", async () => {
    const { buyer, product } = await createOrderLoyaltyFixture();
    const ghostProductId = new mongoose.Types.ObjectId();

    const orderId = await insertLegacyOrder({
      buyerId: buyer._id,
      lines: [
        { productId: product._id, name: "Живой товар" },
        { productId: ghostProductId, name: "Удалённый товар" },
      ],
    });

    const result = await up({ db: db(), isApply: true });

    assert.equal(result.orphanLines, 1, "позиция без товара посчитана отдельно");

    const fresh = await OrderModel.findById(orderId).lean();
    assert.ok(fresh.items[0].sellerIdAtOrder, "живая позиция всё равно заполнена");
    assert.equal(
      fresh.items[1].sellerIdAtOrder ?? null,
      null,
      "у осиротевшей позиции продавца нет",
    );
  });

  it("dry-run считает, но не пишет", async () => {
    const { buyer, product } = await createOrderLoyaltyFixture();
    const orderId = await insertLegacyOrder({
      buyerId: buyer._id,
      lines: [{ productId: product._id }],
    });

    const result = await up({ db: db(), isApply: false });

    assert.equal(result.matched, 1);
    assert.equal(result.wouldMigrate, 1);
    assert.equal(result.modified, undefined, "в dry-run записей не было");

    const raw = await db().collection("orders").findOne({ _id: orderId });
    assert.equal(
      raw.items[0].sellerIdAtOrder ?? null,
      null,
      "документ не изменился",
    );
  });
});
