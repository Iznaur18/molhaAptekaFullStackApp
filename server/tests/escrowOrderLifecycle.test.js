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
const { EscrowLedgerEntryModel, OrderModel } = await import("../models/index.js");
const {
  confirmOrderItemByBuyer,
  markOrderItemCancelled,
  markOrderItemDeliveredBySeller,
  markOrderItemReturned,
  markOrderItemShippedBySeller,
} = await import("../services/order/updateOrderItemStatus.js");
const { openEscrowForPaidOrder } = await import(
  "../services/payments/escrowLedger.js"
);
const { reserveLoyaltyPointsForNewOrder } = await import(
  "../services/order/orderLoyaltyPoints.js"
);
const { runInTransaction, withMongoSession } = await import(
  "../utils/mongoTransaction.js"
);

/**
 * Предоплаченный заказ из двух позиций одного продавца.
 *
 * Именно на такой конфигурации разморозка «всей записи» отдавала продавцу
 * деньги за позицию, которая ещё лежала у него на складе.
 */
async function makePaidTwoItemOrder() {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();

  const line = {
    productId: product._id,
    quantity: 1,
    unitPriceAtOrder: product.productPrice,
    productNameAtOrder: product.productName,
    sellerIdAtOrder: seller._id,
  };
  const itemsForReserve = [
    { ...line, productId: { productSeller: seller._id } },
    { ...line, productId: { productSeller: seller._id } },
  ];

  const order = await runInTransaction(async (session) => {
    await reserveLoyaltyPointsForNewOrder(itemsForReserve, session);
    const [created] = await OrderModel.create(
      [
        {
          userBuyerId: buyer._id,
          items: [line, { ...line }],
          totalAmount: product.productPrice * 2,
          fulfillmentMethod: "delivery",
          deliveryAddress: "Test delivery address",
          deliveryAddressFlat: "1",
          paymentMethod: "cardPrepaid",
          prepaidPaidAt: new Date(),
          shipments: [
            {
              sellerId: seller._id,
              fulfillmentMethod: "delivery",
              courierDelivery: false,
              sellerDeliveryFeeRub: 200,
              platformCommissionPercentAtOrder: 2,
            },
          ],
        },
      ],
      withMongoSession({}, session),
    );
    return created;
  });

  await openEscrowForPaidOrder({ order: order.toObject() });

  return { seller, buyer, product, order };
}

const readLines = async (orderId, sellerId) => {
  const entry = await EscrowLedgerEntryModel.findOne({ orderId, sellerId }).lean();
  return {
    entry,
    goods: (itemIndex) =>
      entry.lines.find((row) => row.kind === "goods" && row.itemIndex === itemIndex),
    delivery: () => entry.lines.find((row) => row.kind === "delivery"),
  };
};

/** Довести позицию до «вручено»: только оттуда покупатель может подтвердить. */
async function deliverItem(order, seller, itemIndex) {
  await markOrderItemShippedBySeller({
    orderId: String(order._id),
    itemIndex,
    sellerId: String(seller._id),
  });
  await markOrderItemDeliveredBySeller({
    orderId: String(order._id),
    itemIndex,
    sellerId: String(seller._id),
    userId: String(seller._id),
  });
}

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("эскроу на живом заказе", () => {
  it("вручение заводит часы только по вручённой позиции", async () => {
    const { seller, order } = await makePaidTwoItemOrder();

    await deliverItem(order, seller, 0);

    const { goods } = await readLines(order._id, seller._id);
    assert.ok(goods(0).releaseDueAt, "по вручённой позиции пошёл отсчёт");
    assert.equal(
      goods(1).releaseDueAt,
      null,
      "вторая позиция ещё у продавца — её срок не идёт",
    );
  });

  it("подтверждение позиции не размораживает деньги за соседнюю", async () => {
    const { seller, buyer, order } = await makePaidTwoItemOrder();
    await deliverItem(order, seller, 0);

    await confirmOrderItemByBuyer({
      orderId: String(order._id),
      itemIndex: 0,
      buyerId: String(buyer._id),
      userId: String(buyer._id),
    });

    const { goods, delivery, entry } = await readLines(order._id, seller._id);
    assert.equal(goods(0).state, "releasable");
    assert.equal(goods(0).releaseReason, "buyer_confirmed");
    assert.equal(
      goods(1).state,
      "held",
      "деньги за неотгруженную позицию продавцу не принадлежат",
    );
    assert.equal(delivery().state, "releasable", "продавец выезжал — доставка его");
    assert.equal(entry.state, "held");
  });

  it("возврат позиции делает её долгом перед покупателем", async () => {
    const { seller, buyer, order } = await makePaidTwoItemOrder();
    await deliverItem(order, seller, 0);

    await markOrderItemReturned({
      orderId: String(order._id),
      itemIndex: 0,
      requestUserId: String(buyer._id),
    });

    const { goods } = await readLines(order._id, seller._id);
    assert.equal(goods(0).state, "refundable");
    assert.equal(goods(0).refundReason, "item_returned");
    assert.equal(
      goods(0).releaseDueAt,
      null,
      "иначе таймер выплатил бы за возвращённый товар",
    );
  });

  it("отмена позиции у продавца делает её долгом перед покупателем", async () => {
    const { seller, buyer, order } = await makePaidTwoItemOrder();

    await markOrderItemCancelled({
      orderId: String(order._id),
      itemIndex: 1,
      requestUserId: String(buyer._id),
      userId: String(buyer._id),
    });

    const { goods, delivery } = await readLines(order._id, seller._id);
    assert.equal(goods(1).state, "refundable");
    assert.equal(goods(1).refundReason, "item_cancelled");
    assert.equal(goods(0).state, "held", "соседнюю позицию отмена не трогает");
    assert.equal(
      delivery().state,
      "held",
      "первая позиция ещё может доехать — судьба доставки не решена",
    );
  });

  it("отменили всё до отгрузки — доставка возвращается покупателю", async () => {
    const { seller, buyer, order } = await makePaidTwoItemOrder();

    for (const itemIndex of [0, 1]) {
      await markOrderItemCancelled({
        orderId: String(order._id),
        itemIndex,
        requestUserId: String(buyer._id),
        userId: String(buyer._id),
      });
    }

    const { delivery, entry } = await readLines(order._id, seller._id);
    assert.equal(delivery().state, "refundable");
    assert.equal(delivery().refundReason, "shipment_undelivered");
    assert.equal(entry.state, "refundable", "продавцу по этому отправлению ничего");
  });
});
