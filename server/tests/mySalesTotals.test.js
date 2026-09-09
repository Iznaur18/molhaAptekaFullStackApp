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
const { OrderModel, ProductModel } = await import("../models/index.js");
const { PRODUCT_MODERATION_APPROVED } = await import(
  "../constants/productModerationConstants.js"
);
const { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } = await import(
  "../constants/orderConstants.js"
);
const { getMySalesController } = await import(
  "../controllers/Order/getMySalesController.js"
);
const { markOrderItemCancelled } = await import(
  "../services/order/cancelOrderItems.js"
);

const UNIT_PRICE = 1000;

/** Заглушка res: контроллер отвечает через successRes. */
const captureResponse = () => {
  const captured = {};
  return {
    captured,
    res: {
      locals: {},
      status(code) {
        captured.status = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    },
  };
};

/** @param {unknown} sellerId */
const loadMySales = async (sellerId) => {
  const { captured, res } = captureResponse();
  await getMySalesController({ userId: String(sellerId), query: {} }, res);
  return captured.body?.data?.orders ?? [];
};

/** Заказ из двух позиций одного продавца по 1000 ₽ за штуку. */
async function makeTwoItemSale() {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const second = await ProductModel.create({
    productName: `${product.productName} #2`,
    productDescription: "Second product description",
    productPrice: UNIT_PRICE,
    productSeller: seller._id,
    productCategory: "grocery",
    productStockQuantity: 10,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productPickupAddress: "Москва, Тверская улица, д 1",
    productPickupLat: 55.757,
    productPickupLon: 37.615,
    productDeliveryEnabled: false,
  });

  const items = [product, second].map((row) => ({
    productId: row._id,
    quantity: 1,
    unitPriceAtOrder: UNIT_PRICE,
    productNameAtOrder: row.productName,
    sellerIdAtOrder: seller._id,
  }));

  const order = await OrderModel.create({
    userBuyerId: buyer._id,
    items,
    totalAmount: items.length * UNIT_PRICE,
    fulfillmentMethod: "delivery",
    deliveryAddress: "Test delivery address",
    deliveryAddressFlat: "1",
    paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  });

  return { seller, order };
}

describe("сумма продажи после отмены позиции", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("до отмены продавец видит сумму обеих позиций", async () => {
    const { seller } = await makeTwoItemSale();

    const [sale] = await loadMySales(seller._id);
    assert.equal(sale.totalAmount, 2 * UNIT_PRICE);
  });

  it("отменённая позиция уходит из суммы продажи", async () => {
    const { seller, order } = await makeTwoItemSale();

    await markOrderItemCancelled({
      orderId: String(order._id),
      itemIndex: 1,
      requestUserId: String(seller._id),
      userId: String(seller._id),
    });

    const [sale] = await loadMySales(seller._id);
    assert.equal(sale.totalAmount, UNIT_PRICE, "платят только за живую позицию");
    assert.equal(sale.items.length, 2, "отменённая строка остаётся видимой");
  });

  it("на отменённом целиком заказе сумма нулевая", async () => {
    const { seller, order } = await makeTwoItemSale();

    for (const itemIndex of [0, 1]) {
      await markOrderItemCancelled({
        orderId: String(order._id),
        itemIndex,
        requestUserId: String(seller._id),
        userId: String(seller._id),
      });
    }

    const [sale] = await loadMySales(seller._id);
    assert.equal(sale.totalAmount, 0);
    assert.equal(sale.status, "cancelled");
  });
});
