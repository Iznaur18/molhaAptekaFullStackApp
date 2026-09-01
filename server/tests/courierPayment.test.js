import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, UserInAppNotificationModel, UserModel } = await import(
  "../models/index.js"
);
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const flow = await import("../services/courier/courierShipmentFlow.js");
const { stripShipmentCodes } = await import(
  "../services/order/sanitizeShipmentCodes.js"
);

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** Доводит курьерское отправление до «Доставлен». */
async function deliveredShipment({ paymentMethod = "cardOnDelivery" } = {}) {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  await OrderModel.updateOne(
    { _id: order._id },
    {
      $set: {
        fulfillmentMethod: "delivery",
        paymentMethod,
        shipments: [
          {
            sellerId: seller._id,
            fulfillmentMethod: "delivery",
            courierDelivery: true,
            deliveryFeeRub: 250,
            sellerPayoutRequisites: "+7 900 000-00-00 (СБП)",
          },
        ],
      },
    },
  );

  const args = { orderId: String(order._id), sellerId: String(seller._id) };
  for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
    await advanceOrderShipmentStatus({ ...args, nextStatus });
  }

  const courier = await UserModel.create({
    userName: `c-${Math.random().toString(36).slice(2, 8)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    courierProfile: { moderationStatus: "approved" },
  });
  const courierId = String(courier._id);

  await flow.acceptShipmentByCourier({ ...args, courierId });
  const { code } = await flow.issueHandoverCode(args);
  await flow.confirmHandoverByCourier({ ...args, courierId, code });
  await flow.startDeliveryByCourier({ ...args, courierId });
  await flow.markArrivedByCourier({ ...args, courierId });

  const fresh = await OrderModel.findById(order._id).lean();
  return { order, seller, buyer, courierId, args, shipment: fresh.shipments[0] };
}

describe("третье рукопожатие: оплата", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("без подтверждения оплаты курьер товар не отдаёт", async () => {
    const { args, courierId, shipment } = await deliveredShipment();

    await assert.rejects(
      () =>
        flow.completeDeliveryByCourier({
          ...args,
          courierId,
          code: shipment.deliveryCode,
        }),
      /не подтвердил оплату/i,
      "курьер не касается денег продавца",
    );
  });

  it("после подтверждения вручение проходит", async () => {
    const { args, courierId, shipment, order } = await deliveredShipment();

    await flow.setShipmentPaymentConfirmed({ ...args, confirmed: true });
    await flow.completeDeliveryByCourier({
      ...args,
      courierId,
      code: shipment.deliveryCode,
    });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "confirmed");
  });

  it("покупатель узнаёт, что перевод дошёл", async () => {
    const { args, buyer } = await deliveredShipment();

    await flow.setShipmentPaymentConfirmed({ ...args, confirmed: true });

    const notifications = await UserInAppNotificationModel.find({
      userId: buyer._id,
      kind: "shipment_payment_confirmed",
    }).lean();
    assert.equal(
      notifications.length,
      1,
      "иначе покупатель перевёл деньги и сидит в тишине",
    );
  });
  it("подтверждение до приезда курьера не принимается", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          fulfillmentMethod: "delivery",
          paymentMethod: "cardOnDelivery",
          shipments: [
            {
              sellerId: seller._id,
              fulfillmentMethod: "delivery",
              courierDelivery: true,
            },
          ],
        },
      },
    );

    await assert.rejects(
      () =>
        flow.setShipmentPaymentConfirmed({
          orderId: String(order._id),
          sellerId: String(seller._id),
          confirmed: true,
        }),
      /когда курьер уже привёз/i,
    );
  });

  it("наличный заказ подтверждать нечего", async () => {
    const { args } = await deliveredShipment({ paymentMethod: "cashOnDelivery" });

    await assert.rejects(
      () => flow.setShipmentPaymentConfirmed({ ...args, confirmed: true }),
      /оплачивается иначе/i,
    );
  });

  it("наличным вручение не блокируется", async () => {
    const { args, courierId, shipment, order } = await deliveredShipment({
      paymentMethod: "cashOnDelivery",
    });

    await flow.completeDeliveryByCourier({
      ...args,
      courierId,
      code: shipment.deliveryCode,
    });

    assert.equal((await OrderModel.findById(order._id).lean()).status, "confirmed");
  });

  it("откат подтверждения возможен до вручения", async () => {
    const { args, order } = await deliveredShipment();
    await flow.setShipmentPaymentConfirmed({ ...args, confirmed: true });

    // На «Доставлен» откат уже закрыт: товар вот-вот отдадут.
    await assert.rejects(
      () => flow.setShipmentPaymentConfirmed({ ...args, confirmed: false }),
      /уже нельзя/i,
    );
    assert.ok((await OrderModel.findById(order._id).lean()).shipments[0].paymentConfirmedAt);
  });
});

describe("реквизиты продавца в ответе", () => {
  /** @param {string} status */
  const makeOrder = (status) => ({
    items: [{ sellerIdAtOrder: SELLER, status }],
    shipments: [
      {
        sellerId: SELLER,
        fulfillmentMethod: "delivery",
        courierDelivery: true,
        sellerPayoutRequisites: "+7 900 000-00-00",
      },
    ],
  });

  it("до передачи товара покупатель их не видит", () => {
    const order = stripShipmentCodes(makeOrder("courier_assigned"), "buyer");

    assert.equal(
      order.shipments[0].sellerPayoutRequisites,
      undefined,
      "переводить ещё некуда и незачем",
    );
  });

  it("после передачи открываются", () => {
    for (const status of ["courier_holding", "in_delivery", "delivered"]) {
      assert.equal(
        stripShipmentCodes(makeOrder(status), "buyer").shipments[0]
          .sellerPayoutRequisites,
        "+7 900 000-00-00",
        `должны быть видны на ${status}`,
      );
    }
  });

  it("курьеру реквизиты продавца не показываются", () => {
    const order = stripShipmentCodes(makeOrder("courier_holding"), "courier");

    assert.equal(order.shipments[0].sellerPayoutRequisites, undefined);
  });
});
