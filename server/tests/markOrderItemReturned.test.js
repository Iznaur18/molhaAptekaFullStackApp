import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, ProductModel, UserInAppNotificationModel } = await import(
  "../models/index.js"
);
const {
  markOrderItemDeliveredBySeller,
  markOrderItemReturnedBySeller,
  markOrderItemShippedBySeller,
} = await import("../services/order/updateOrderItemStatus.js");
const { getReservedQuantityByProductIds } = await import(
  "../services/product/productStock.js"
);
const { buildOrderStatusFromItems } = await import(
  "../services/order/orderStatus.js"
);

/** @returns {Promise<{ seller: any; buyer: any; product: any; order: any }>} */
async function makeOrder() {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  return { seller, buyer, product, order };
}

/** @param {any} order @param {string} sellerId */
const ship = (order, sellerId) =>
  markOrderItemShippedBySeller({
    orderId: String(order._id),
    itemIndex: 0,
    sellerId: String(sellerId),
  });

/** @param {any} order @param {string} sellerId */
const deliver = (order, sellerId) =>
  markOrderItemDeliveredBySeller({
    orderId: String(order._id),
    itemIndex: 0,
    sellerId: String(sellerId),
    userId: String(sellerId),
  });

/** @param {any} order @param {string} sellerId */
const doReturn = (order, sellerId) =>
  markOrderItemReturnedBySeller({
    orderId: String(order._id),
    itemIndex: 0,
    sellerId: String(sellerId),
  });

describe("статус заказа из позиций", () => {
  it("все позиции возвращены → заказ возвращён", () => {
    assert.equal(
      buildOrderStatusFromItems([{ status: "returned" }, { status: "returned" }]),
      "returned",
    );
  });

  it("часть отменена, часть возвращена → заказ отменён", () => {
    assert.equal(
      buildOrderStatusFromItems([{ status: "cancelled" }, { status: "returned" }]),
      "cancelled",
    );
  });

  it("возврат рядом с активной позицией не закрывает заказ", () => {
    assert.equal(
      buildOrderStatusFromItems([{ status: "returned" }, { status: "pending" }]),
      "pending",
    );
  });
});

describe("оформление возврата продавцом", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("возвращает позицию из «Отправлен» и снимает резерв", async () => {
    const { seller, product, order } = await makeOrder();
    await ship(order, seller._id);

    const beforeReturn = await getReservedQuantityByProductIds([
      String(product._id),
    ]);
    assert.equal(beforeReturn[String(product._id)], 1, "отправленное занимает остаток");

    await doReturn(order, seller._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].status, "returned");
    assert.equal(fresh.status, "returned");
    assert.ok(fresh.items[0].returnedAt, "проставлена дата возврата");

    const afterReturn = await getReservedQuantityByProductIds([String(product._id)]);
    assert.equal(
      afterReturn[String(product._id)] ?? 0,
      0,
      "резерв снят — товар снова можно купить",
    );
  });

  it("возвращает позицию из «Доставлен» и откручивает счётчик продаж", async () => {
    const { seller, product, order } = await makeOrder();
    await ship(order, seller._id);
    await deliver(order, seller._id);

    const sold = await ProductModel.findById(product._id)
      .select("soldQuantity")
      .lean();
    assert.equal(sold.soldQuantity, 1, "доставленное считается проданным");

    await doReturn(order, seller._id);

    const afterReturn = await ProductModel.findById(product._id)
      .select("soldQuantity")
      .lean();
    assert.equal(
      afterReturn.soldQuantity,
      0,
      "возврат снимает позицию из продаж",
    );
  });

  it("не даёт оформить возврат из «В обработке» — там отмена", async () => {
    const { seller, order } = await makeOrder();

    await assert.rejects(() => doReturn(order, seller._id), /Отправлен|Доставлен/);
  });

  it("не даёт чужому продавцу тронуть позицию", async () => {
    const { seller, order } = await makeOrder();
    const other = await createOrderLoyaltyFixture();
    await ship(order, seller._id);

    await assert.rejects(() => doReturn(order, other.seller._id));
  });

  it("повторный возврат не ломается и не задваивает эффекты", async () => {
    const { seller, product, order } = await makeOrder();
    await ship(order, seller._id);
    await deliver(order, seller._id);
    await doReturn(order, seller._id);
    await doReturn(order, seller._id);

    const fresh = await ProductModel.findById(product._id)
      .select("soldQuantity")
      .lean();
    assert.equal(fresh.soldQuantity, 0, "счётчик не ушёл в минус");
  });

  it("уведомляет покупателя о возврате", async () => {
    const { seller, buyer, order } = await makeOrder();
    await ship(order, seller._id);
    await doReturn(order, seller._id);

    const rows = await UserInAppNotificationModel.find({ userId: buyer._id })
      .sort({ createdAt: 1 })
      .lean();
    // Первое — про отправку, второе — про возврат.
    assert.equal(rows.length, 2);
    assert.match(rows[0].message, /передан в доставку/);
    assert.match(rows[1].message, /вернулся продавцу/);
  });

  it("освобождает зарезервированные баллы продавца", async () => {
    const { seller, order } = await makeOrder();
    const { UserModel } = await import("../models/index.js");

    const before = await UserModel.findById(seller._id)
      .select("userLoyaltyPointsReserved")
      .lean();
    assert.ok(before.userLoyaltyPointsReserved > 0, "баллы зарезервированы заказом");

    await ship(order, seller._id);
    await doReturn(order, seller._id);

    const afterReturn = await UserModel.findById(seller._id)
      .select("userLoyaltyPointsReserved")
      .lean();
    assert.equal(
      afterReturn.userLoyaltyPointsReserved,
      0,
      "резерв баллов снят вместе с возвратом",
    );
  });
});
