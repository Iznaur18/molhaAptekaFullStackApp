import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { createOrder } = await import("../services/order/createOrder.js");
const { confirmOrderItemByBuyer, markOrderItemReturned } =
  await import("../services/order/updateOrderItemStatus.js");
const { markOrderItemCancelled } =
  await import("../services/order/cancelOrderItems.js");
const { processPointsPaymentReleaseCronTasks } =
  await import("../services/order/orderPointsPayment.js");
const { buildProductPatchSet } =
  await import("../services/product/buildProductPatchSet.js");
const { OrderModel, ProductModel, UserModel } = await import("../models/index.js");

const POINTS_PRICE = 250;
const BUYER_POINTS = 1000;

/**
 * Продавец, покупатель с баллами и товар за баллы (самовывоз).
 *
 * @param {{ limit?: number | null; buyerPoints?: number }} [options]
 */
async function makePointsSaleFixture(options = {}) {
  const { seller, buyer, product } = await createOrderLoyaltyFixture({
    loyaltyPointsPerUnit: 0,
  });
  await UserModel.updateOne(
    { _id: buyer._id },
    {
      $set: {
        isEmailVerified: true,
        userLoyaltyPoints: options.buyerPoints ?? BUYER_POINTS,
      },
    },
  );
  await ProductModel.updateOne(
    { _id: product._id },
    {
      $set: {
        productPointsSaleEnabled: true,
        productPointsPrice: POINTS_PRICE,
        productPointsPerBuyerLimit: options.limit === undefined ? 1 : options.limit,
      },
    },
  );
  return { seller, buyer, product };
}

/** @param {{ buyer: any; product: any; quantity?: number }} params */
const orderPointsProduct = ({ buyer, product, quantity = 1 }) =>
  createOrder({
    userId: String(buyer._id),
    items: [{ productId: String(product._id), quantity }],
    paymentMethod: "cashOnDelivery",
    fulfillmentMethod: "pickup",
  });

/** Позиция вручена: от «Доставлен» покупатель подтверждает, и идёт таймер. */
const markDelivered = (orderId, deliveredAt = new Date()) =>
  OrderModel.updateOne(
    { _id: orderId },
    { $set: { "items.0.status": "delivered", "items.0.deliveredAt": deliveredAt } },
  );

const readUser = (id) =>
  UserModel.findById(id).select("userLoyaltyPoints userLoyaltyPointsReserved").lean();

describe("продажа за баллы", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("заказ резервирует баллы покупателя, рублей за товар нет", async () => {
    const { buyer, product } = await makePointsSaleFixture();

    const order = await orderPointsProduct({ buyer, product });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.paidWithLoyaltyPoints, true);
    assert.equal(fresh.loyaltyPointsTotal, POINTS_PRICE);
    assert.equal(fresh.totalAmount, 0);
    assert.equal(fresh.items[0].unitPriceAtOrder, 0);
    assert.equal(fresh.items[0].pointsPaymentState, "held");
    assert.equal(fresh.items[0].loyaltyPointsReservedTotal, 0, "кешбэка нет");

    const buyerRow = await readUser(buyer._id);
    assert.equal(buyerRow.userLoyaltyPoints, BUYER_POINTS);
    assert.equal(buyerRow.userLoyaltyPointsReserved, POINTS_PRICE);
  });

  it("подтверждение получения отдаёт баллы продавцу за вычетом 2%", async () => {
    const { seller, buyer, product } = await makePointsSaleFixture();
    const order = await orderPointsProduct({ buyer, product });
    await markDelivered(order._id);

    await confirmOrderItemByBuyer({
      orderId: String(order._id),
      itemIndex: 0,
      buyerId: String(buyer._id),
      userId: String(buyer._id),
    });

    const buyerRow = await readUser(buyer._id);
    const sellerRow = await readUser(seller._id);
    assert.equal(buyerRow.userLoyaltyPoints, BUYER_POINTS - POINTS_PRICE);
    assert.equal(buyerRow.userLoyaltyPointsReserved, 0);
    // 2% от 250 = 5 баллов площадке, продавцу 245 сверх его 200.
    assert.equal(sellerRow.userLoyaltyPoints, 200 + 245);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].pointsPaymentState, "released");
    assert.equal(fresh.items[0].pointsCommissionTotal, 5);
  });

  it("отмена до выдачи возвращает баллы покупателю", async () => {
    const { seller, buyer, product } = await makePointsSaleFixture();
    const order = await orderPointsProduct({ buyer, product });

    await markOrderItemCancelled({
      orderId: String(order._id),
      itemIndex: 0,
      requestUserId: String(buyer._id),
      userId: String(buyer._id),
    });

    const buyerRow = await readUser(buyer._id);
    assert.equal(buyerRow.userLoyaltyPoints, BUYER_POINTS);
    assert.equal(buyerRow.userLoyaltyPointsReserved, 0);
    assert.equal((await readUser(seller._id)).userLoyaltyPoints, 200);

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].pointsPaymentState, "refunded");
  });

  it("возврат вручённого товара до выплаты снимает резерв", async () => {
    const { seller, buyer, product } = await makePointsSaleFixture();
    const order = await orderPointsProduct({ buyer, product });
    await markDelivered(order._id);

    await markOrderItemReturned({
      orderId: String(order._id),
      itemIndex: 0,
      requestUserId: String(seller._id),
    });

    const buyerRow = await readUser(buyer._id);
    assert.equal(buyerRow.userLoyaltyPoints, BUYER_POINTS);
    assert.equal(buyerRow.userLoyaltyPointsReserved, 0);
  });

  it("через 7 дней после вручения баллы уходят продавцу сами, один раз", async () => {
    const { seller, buyer, product } = await makePointsSaleFixture();
    const order = await orderPointsProduct({ buyer, product });
    await markDelivered(order._id, new Date(Date.now() - 8 * 24 * 60 * 60 * 1000));

    const first = await processPointsPaymentReleaseCronTasks();
    const second = await processPointsPaymentReleaseCronTasks();

    assert.equal(first.released, 1);
    assert.equal(second.released, 0);
    assert.equal((await readUser(seller._id)).userLoyaltyPoints, 200 + 245);
    assert.equal((await readUser(buyer._id)).userLoyaltyPointsReserved, 0);
  });

  it("свежевручённый заказ таймер не трогает", async () => {
    const { buyer, product } = await makePointsSaleFixture();
    const order = await orderPointsProduct({ buyer, product });
    await markDelivered(order._id);

    assert.equal((await processPointsPaymentReleaseCronTasks()).released, 0);
  });

  it("не хватает баллов — заказа нет", async () => {
    const { buyer, product } = await makePointsSaleFixture({ buyerPoints: 100 });

    await assert.rejects(() => orderPointsProduct({ buyer, product }), {
      statusCode: 400,
      message: /Недостаточно баллов/,
    });
    assert.equal(await OrderModel.countDocuments({}), 0);
  });

  it("лимит в одни руки считает прошлые заказы и не считает отменённые", async () => {
    const { buyer, product } = await makePointsSaleFixture({ limit: 1 });

    const first = await orderPointsProduct({ buyer, product });
    await assert.rejects(() => orderPointsProduct({ buyer, product }), {
      statusCode: 400,
      message: /не больше 1 шт/,
    });

    await markOrderItemCancelled({
      orderId: String(first._id),
      itemIndex: 0,
      requestUserId: String(buyer._id),
      userId: String(buyer._id),
    });
    await orderPointsProduct({ buyer, product });
  });

  it("без лимита можно взять несколько штук", async () => {
    const { buyer, product } = await makePointsSaleFixture({ limit: null });

    const order = await orderPointsProduct({ buyer, product, quantity: 3 });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.loyaltyPointsTotal, POINTS_PRICE * 3);
  });

  it("за баллы нельзя заказать с предоплатой", async () => {
    const { buyer, product } = await makePointsSaleFixture();

    await assert.rejects(
      () =>
        createOrder({
          userId: String(buyer._id),
          items: [{ productId: String(product._id), quantity: 1 }],
          paymentMethod: "cardPrepaid",
          fulfillmentMethod: "pickup",
        }),
      { statusCode: 400 },
    );
  });
});

describe("включение продажи за баллы в управлении товара", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("гасит акции и кешбэк", async () => {
    const { product } = await createOrderLoyaltyFixture();
    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { productWholesaleEnabled: true, affiliateEnabled: true } },
    );
    const existing = await ProductModel.findById(product._id).lean();

    const { $set } = await buildProductPatchSet({
      existing,
      body: { productPointsSaleEnabled: true, productPointsPrice: 300 },
      skipsModeration: false,
      productId: String(product._id),
    });

    assert.equal($set.productPointsSaleEnabled, true);
    assert.equal($set.productPointsPrice, 300);
    assert.equal($set.productWholesaleEnabled, false);
    assert.equal($set.affiliateEnabled, false);
    assert.equal($set.loyaltyPointsPerUnit, 0);
    assert.equal($set.productModerationStatus, undefined, "модерация не нужна");
  });

  it("без цены в баллах не включается", async () => {
    const { product } = await createOrderLoyaltyFixture();
    const existing = await ProductModel.findById(product._id).lean();

    await assert.rejects(
      () =>
        buildProductPatchSet({
          existing,
          body: { productPointsSaleEnabled: true },
          skipsModeration: false,
          productId: String(product._id),
        }),
      { statusCode: 400 },
    );
  });

  it("при включённом аукционе просит выключить его сначала", async () => {
    const { product } = await createOrderLoyaltyFixture();
    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { productAuctionEnabled: true } },
    );
    const existing = await ProductModel.findById(product._id).lean();

    await assert.rejects(
      () =>
        buildProductPatchSet({
          existing,
          body: { productPointsSaleEnabled: true, productPointsPrice: 100 },
          skipsModeration: false,
          productId: String(product._id),
        }),
      { statusCode: 409 },
    );
  });

  it("у товара за баллы нельзя включить опт", async () => {
    const { product } = await createOrderLoyaltyFixture({ loyaltyPointsPerUnit: 0 });
    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { productPointsSaleEnabled: true, productPointsPrice: 100 } },
    );
    const existing = await ProductModel.findById(product._id).lean();

    await assert.rejects(
      () =>
        buildProductPatchSet({
          existing,
          body: { productWholesaleEnabled: true },
          skipsModeration: false,
          productId: String(product._id),
        }),
      { statusCode: 400 },
    );
  });
});
