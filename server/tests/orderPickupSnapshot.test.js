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
const { OrderModel, ProductModel, UserModel } = await import("../models/index.js");

/**
 * Заказ с доставкой: точка отправления должна попасть в позицию снимком.
 *
 * Без снимка курьера вызывали по адресу, который лежит в товаре на момент
 * сборки: 23.09.2026 продавец поменял адрес в профиле, а заказ уже уехал в
 * ЛОБО по старому.
 */
describe("снимок точки отправления в заказе", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("доставка: адрес отправления запоминается в позиции", async () => {
    const { buyer, product } = await createOrderLoyaltyFixture();
    await UserModel.updateOne({ _id: buyer._id }, { $set: { isEmailVerified: true } });
    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { productDeliveryCarrier: "seller", productDeliveryEnabled: true } },
    );

    const order = await createOrder({
      userId: String(buyer._id),
      items: [{ productId: String(product._id), quantity: 1 }],
      paymentMethod: "cashOnDelivery",
      fulfillmentMethod: "delivery",
      verifiedDeliveryAddress: {
        displayAddress: "г Грозный, ул Мира, 7",
        flat: "",
        fiasId: "83576c41-f242-445b-be8c-62c355a35bfc",
      },
      deliveryAddressGeo: { lat: 43.31, lon: 45.69 },
    });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.items[0].pickupAddressAtOrder, "Москва, Тверская улица, д 1");
    assert.equal(fresh.items[0].pickupLatAtOrder, 55.757);
  });

  // Товар без точки отправления заказать нельзя вовсе: сервер отвергает его
  // раньше, на проверке точек. Поэтому снимок либо есть, либо заказа нет.
});
