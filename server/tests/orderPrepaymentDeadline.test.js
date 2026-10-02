import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
// Провайдер не настроен: открытый платёж проверить нечем — значит, не отменяем.
delete process.env.YOOKASSA_SHOP_ID;
delete process.env.YOOKASSA_SECRET_KEY;

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, PaymentModel, UserInAppNotificationModel, UserModel } =
  await import("../models/index.js");
const { getReservedQuantityByProductIds } =
  await import("../services/product/productStock.js");
const { processOrderPrepaymentDeadlines, formatPrepaymentDeadlineMsk } =
  await import("../services/payments/orderPrepaymentDeadline.js");

const HOUR = 60 * 60 * 1000;

/**
 * Заказ по СБП, подтверждённый продавцом, но не оплаченный.
 *
 * @param {{ dueInMs?: number | null; itemStatus?: string }} [options]
 */
async function makeUnpaidOrder({ dueInMs = -HOUR, itemStatus = "accepted" } = {}) {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  await OrderModel.updateOne(
    { _id: order._id },
    {
      $set: {
        paymentMethod: "cardPrepaid",
        status: itemStatus,
        "items.0.status": itemStatus,
        prepaymentDueAt: dueInMs === null ? null : new Date(Date.now() + dueInMs),
      },
    },
  );
  return { seller, buyer, product, order };
}

/** @param {unknown} orderId */
const freshOrder = (orderId) => OrderModel.findById(orderId).lean();

describe("срок оплаты заказа по СБП", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("срок прошёл, платежей нет — заказ отменён, товар снова в продаже", async () => {
    const { seller, buyer, product, order } = await makeUnpaidOrder();

    const result = await processOrderPrepaymentDeadlines();

    assert.equal(result.cancelled, 1);
    const fresh = await freshOrder(order._id);
    assert.equal(fresh.items[0].status, "cancelled");
    assert.equal(fresh.status, "cancelled");
    assert.ok(fresh.prepaymentExpiredAt, "отмечено, что отменил крон");
    const reserved = await getReservedQuantityByProductIds([String(product._id)]);
    assert.equal(reserved[String(product._id)] ?? 0, 0, "резерв снят");

    const buyerNotes = await UserInAppNotificationModel.find({
      userId: buyer._id,
    }).lean();
    assert.ok(buyerNotes.some((row) => /не пришла за сутки/.test(row.message)));
    const sellerNotes = await UserInAppNotificationModel.find({
      userId: seller._id,
    }).lean();
    assert.ok(sellerNotes.some((row) => /не оплатил заказ/.test(row.message)));

    const sellerUser = await UserModel.findById(seller._id)
      .select("userLoyaltyPointsReserved")
      .lean();
    assert.equal(sellerUser.userLoyaltyPointsReserved, 0, "резерв баллов снят");
  });

  it("покупатель только что пытался оплатить — не отменяем ещё полчаса", async () => {
    const { buyer, order } = await makeUnpaidOrder();
    await PaymentModel.create({
      userId: buyer._id,
      purpose: "order",
      orderId: order._id,
      amountRub: 1000,
      status: "canceled",
      idempotenceKey: "attempt-recent",
    });

    const result = await processOrderPrepaymentDeadlines();

    assert.equal(result.cancelled, 0);
    assert.equal(result.deferred, 1);
    assert.equal((await freshOrder(order._id)).items[0].status, "accepted");
  });

  it("открытый платёж, который не проверить у провайдера, — не отменяем", async () => {
    const { buyer, order } = await makeUnpaidOrder();
    const payment = await PaymentModel.create({
      userId: buyer._id,
      purpose: "order",
      orderId: order._id,
      amountRub: 1000,
      status: "created",
      providerPaymentId: "yk-open",
      idempotenceKey: "attempt-open",
    });
    // Попытка была давно — дело именно в открытом платеже, а не в «только что».
    await PaymentModel.collection.updateOne(
      { _id: payment._id },
      {
        $set: {
          createdAt: new Date(Date.now() - 5 * HOUR),
          updatedAt: new Date(Date.now() - 5 * HOUR),
        },
      },
    );

    const result = await processOrderPrepaymentDeadlines();

    assert.equal(result.cancelled, 0);
    assert.equal((await freshOrder(order._id)).items[0].status, "accepted");
  });

  it("за 3 часа до срока — одно напоминание, повторный проход не дублирует", async () => {
    const { buyer, order } = await makeUnpaidOrder({ dueInMs: 2 * HOUR });

    await processOrderPrepaymentDeadlines();
    await processOrderPrepaymentDeadlines();

    const notes = await UserInAppNotificationModel.find({ userId: buyer._id }).lean();
    const reminders = notes.filter((row) => /иначе он отменится/.test(row.message));
    assert.equal(reminders.length, 1);
    assert.ok((await freshOrder(order._id)).prepaymentReminderSentAt);
    assert.equal((await freshOrder(order._id)).items[0].status, "accepted");
  });

  it("подтверждён до появления срока — получает сутки, а не отмену задним числом", async () => {
    const { order } = await makeUnpaidOrder({ dueInMs: null });

    const result = await processOrderPrepaymentDeadlines();

    assert.equal(result.backfilled, 1);
    assert.equal(result.cancelled, 0);
    const fresh = await freshOrder(order._id);
    const left = new Date(fresh.prepaymentDueAt).getTime() - Date.now();
    assert.ok(left > 23 * HOUR && left <= 24 * HOUR, `осталось ${left} мс`);
  });

  it("продавец ещё не подтвердил — срок не идёт", async () => {
    const { order } = await makeUnpaidOrder({ itemStatus: "pending" });

    const result = await processOrderPrepaymentDeadlines();

    assert.equal(result.cancelled, 0);
    assert.equal((await freshOrder(order._id)).items[0].status, "pending");
  });

  it("оплаченный заказ не трогаем", async () => {
    const { order } = await makeUnpaidOrder();
    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { prepaidPaidAt: new Date() } },
    );

    const result = await processOrderPrepaymentDeadlines();

    assert.equal(result.cancelled, 0);
    assert.equal((await freshOrder(order._id)).items[0].status, "accepted");
  });

  it("срок в уведомлении — по Москве", () => {
    assert.equal(
      formatPrepaymentDeadlineMsk(new Date("2026-10-04T12:30:00Z")),
      "4 октября, 15:30",
    );
  });
});
