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
const { UserModel } = await import("../models/index.js");

describe("Яндекс Доставка при оформлении заказа", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  for (const paymentMethod of ["cashOnDelivery", "cardPrepaid"]) {
    it(`оплата «${paymentMethod}» с Яндексом не принимается — только картой в пункте`, async () => {
      const { buyer, product } = await createOrderLoyaltyFixture();
      await UserModel.updateOne(
        { _id: buyer._id },
        { $set: { isEmailVerified: true } },
      );

      await assert.rejects(
        createOrder({
          userId: String(buyer._id),
          items: [{ productId: String(product._id), quantity: 1 }],
          paymentMethod,
          fulfillmentMethod: "delivery",
          yandexDeliveryShipment: {
            pickupPointId: "0198602de4a6749aba12e151bdf4caaa",
            recipient: { name: "Иван Петров", phone: "+79990001122" },
          },
        }),
        /только картой в пункте выдачи/,
      );
    });
  }
});
