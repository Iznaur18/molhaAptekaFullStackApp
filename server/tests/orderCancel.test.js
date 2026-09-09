import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture } = await import(
  "./helpers/orderLoyaltyTestHelpers.js"
);
const { OrderModel, ProductModel, UserInAppNotificationModel } = await import(
  "../models/index.js"
);
const { PRODUCT_MODERATION_APPROVED } = await import(
  "../constants/productModerationConstants.js"
);
const { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } = await import(
  "../constants/orderConstants.js"
);
const { buildOrderLineLoyaltySnapshot, reserveLoyaltyPointsForNewOrder } = await import(
  "../services/order/orderLoyaltyPoints.js"
);
const { runInTransaction, withMongoSession } = await import(
  "../utils/mongoTransaction.js"
);
const { cancelOrderShipment, markOrderItemCancelled } = await import(
  "../services/order/cancelOrderItems.js"
);
const { markOrderItemShippedBySeller } = await import(
  "../services/order/updateOrderItemStatus.js"
);
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);

/**
 * Заказ из двух позиций одного продавца — корзина, собранная у одного магазина.
 *
 * @returns {Promise<{ seller: any; buyer: any; products: any[]; order: any }>}
 */
async function makeTwoItemOrder() {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const second = await ProductModel.create({
    productName: `${product.productName} #2`,
    productDescription: "Second product description",
    productPrice: 2000,
    productSeller: seller._id,
    productCategory: "grocery",
    productStockQuantity: 10,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    loyaltyPointsPerUnit: product.loyaltyPointsPerUnit,
    productPickupAddress: "Москва, Тверская улица, д 1",
    productPickupLat: 55.757,
    productPickupLon: 37.615,
    productDeliveryEnabled: false,
  });

  const products = [product, second];
  const items = products.map((row) => ({
    productId: row._id,
    quantity: 1,
    unitPriceAtOrder: row.productPrice,
    productNameAtOrder: row.productName,
    sellerIdAtOrder: seller._id,
    ...buildOrderLineLoyaltySnapshot({
      loyaltyPointsPerUnit: row.loyaltyPointsPerUnit,
      quantity: 1,
    }),
  }));

  const order = await runInTransaction(async (session) => {
    await reserveLoyaltyPointsForNewOrder(
      items.map((item) => ({ ...item, productId: { productSeller: seller._id } })),
      session,
    );
    const [created] = await OrderModel.create(
      [
        {
          userBuyerId: buyer._id,
          items,
          totalAmount: items.reduce((sum, item) => sum + item.unitPriceAtOrder, 0),
          fulfillmentMethod: "delivery",
          deliveryAddress: "Test delivery address",
          deliveryAddressFlat: "1",
          paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
        },
      ],
      withMongoSession({}, session),
    );
    return created;
  });

  return { seller, buyer, products, order };
}

const cancelItem = (order, itemIndex, userId) =>
  markOrderItemCancelled({
    orderId: String(order._id),
    itemIndex,
    requestUserId: String(userId),
    userId: String(userId),
  });

const cancelOrder = (order, sellerId, userId) =>
  cancelOrderShipment({
    orderId: String(order._id),
    sellerId: String(sellerId),
    requestUserId: String(userId),
    userId: String(userId),
  });

describe("отмена одной позиции в многопозиционном заказе", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("продавец отменяет вторую позицию — первая остаётся активной", async () => {
    const { seller, order } = await makeTwoItemOrder();

    await cancelItem(order, 1, seller._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].status, "pending", "первая позиция не тронута");
    assert.equal(fresh.items[1].status, "cancelled", "вторая позиция отменена");
    assert.equal(fresh.status, "pending", "заказ ещё в работе");
  });

  it("покупатель отменяет первую позицию", async () => {
    const { buyer, order } = await makeTwoItemOrder();

    await cancelItem(order, 0, buyer._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].status, "cancelled");
    assert.equal(fresh.items[1].status, "pending");
  });

  it("отмена обеих позиций по очереди закрывает заказ", async () => {
    const { seller, order } = await makeTwoItemOrder();

    await cancelItem(order, 0, seller._id);
    await cancelItem(order, 1, seller._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "cancelled");
  });

  it("позицию с удалённым из каталога товаром всё равно можно отменить", async () => {
    const { seller, products, order } = await makeTwoItemOrder();
    await ProductModel.deleteOne({ _id: products[1]._id });

    await cancelItem(order, 1, seller._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[1].status, "cancelled");
    assert.equal(fresh.items[0].status, "pending");
  });

  it("посторонний пользователь позицию отменить не может", async () => {
    const { order } = await makeTwoItemOrder();
    const stranger = await createOrderLoyaltyFixture();

    await assert.rejects(() => cancelItem(order, 0, stranger.buyer._id), /Нет прав/);
  });

  it("повторный клик по отмене не шлёт покупателю второе уведомление", async () => {
    const { seller, buyer, order } = await makeTwoItemOrder();

    await cancelItem(order, 0, seller._id);
    await cancelItem(order, 0, seller._id);

    const rows = await UserInAppNotificationModel.find({ userId: buyer._id }).lean();
    assert.equal(rows.length, 1, "гасить было уже нечего");
  });

  it("после отмены позиции отправление продолжает лестницу с той же ступени", async () => {
    const { seller, order } = await makeTwoItemOrder();
    const advance = (nextStatus) =>
      advanceOrderShipmentStatus({
        orderId: String(order._id),
        sellerId: String(seller._id),
        nextStatus,
      });

    await advance("accepted");
    await cancelItem(order, 1, seller._id);

    const afterCancel = await OrderModel.findById(order._id).lean();
    assert.equal(afterCancel.status, "accepted", "отменённая строка не сбросила ступень");

    // Продавцу рисуют кнопку по статусу заказа: разойдись он с сервером —
    // клиент слал бы «accepted» и получал 409.
    const { order: fresh } = await advance("assembling");
    assert.equal(fresh.items[0].status, "assembling");
    assert.equal(fresh.items[1].status, "cancelled");
  });

  it("отгружённую позицию отменить нельзя", async () => {
    const { seller, order } = await makeTwoItemOrder();
    await markOrderItemShippedBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    await assert.rejects(
      () => cancelItem(order, 0, seller._id),
      /пока товар у продавца/,
    );
  });
});

describe("отмена заказа целиком", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("покупатель гасит все позиции отправления одним действием", async () => {
    const { seller, buyer, order } = await makeTwoItemOrder();

    await cancelOrder(order, seller._id, buyer._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.deepEqual(
      fresh.items.map((item) => item.status),
      ["cancelled", "cancelled"],
    );
    assert.equal(fresh.status, "cancelled");
  });

  it("отменяется только отправление карточки, чужие позиции не трогаются", async () => {
    const { seller, buyer, order } = await makeTwoItemOrder();
    const other = await createOrderLoyaltyFixture();
    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { "items.1.sellerIdAtOrder": other.seller._id } },
    );

    await cancelOrder(order, seller._id, buyer._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].status, "cancelled");
    assert.equal(fresh.items[1].status, "pending", "позиция другого продавца жива");
    assert.equal(fresh.status, "pending");
  });

  it("уже отменённые позиции повторную отмену не ломают", async () => {
    const { seller, order } = await makeTwoItemOrder();
    await cancelItem(order, 0, seller._id);

    await cancelOrder(order, seller._id, seller._id);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "cancelled");
  });

  it("повторная отмена уже отменённого заказа отвечает понятной ошибкой", async () => {
    const { seller, buyer, order } = await makeTwoItemOrder();
    await cancelOrder(order, seller._id, buyer._id);

    await assert.rejects(() => cancelOrder(order, seller._id, buyer._id), /уже отмен/);
  });

  it("после отгрузки одной позиции заказ целиком не отменяется", async () => {
    const { seller, order } = await makeTwoItemOrder();
    await markOrderItemShippedBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    await assert.rejects(
      () => cancelOrder(order, seller._id, seller._id),
      /пока товар у продавца/,
    );

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[1].status, "pending", "ничего не отменилось частично");
  });

  it("посторонний пользователь заказ отменить не может", async () => {
    const { seller, order } = await makeTwoItemOrder();
    const stranger = await createOrderLoyaltyFixture();

    await assert.rejects(
      () => cancelOrder(order, seller._id, stranger.seller._id),
      /Нет прав/,
    );
  });

  it("продавец не может отменить отправление другого продавца", async () => {
    const { seller, order } = await makeTwoItemOrder();
    const other = await createOrderLoyaltyFixture();

    await assert.rejects(
      () => cancelOrder(order, other.seller._id, other.seller._id),
      /Отправление не найдено/,
    );

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].status, "pending");
    assert.equal(String(fresh.items[0].sellerIdAtOrder), String(seller._id));
  });

  it("покупателю уходит одно уведомление об отмене всего заказа", async () => {
    const { seller, buyer, order } = await makeTwoItemOrder();

    await cancelOrder(order, seller._id, seller._id);

    const rows = await UserInAppNotificationModel.find({ userId: buyer._id }).lean();
    assert.equal(rows.length, 1, "не по одному уведомлению на позицию");
    assert.match(rows[0].message, /отменил заказ/);
  });
});
