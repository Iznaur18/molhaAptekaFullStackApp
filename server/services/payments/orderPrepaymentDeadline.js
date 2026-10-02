import {
  BUYER_ORDER_PREPAYMENT_EXPIRED_MESSAGE,
  BUYER_ORDER_PREPAYMENT_REMINDER_MESSAGE,
  IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
  IN_APP_NOTIFICATION_KIND_SELLER_NEW_ORDER,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PREPAYMENT_ATTEMPT_GRACE_MS,
  ORDER_PREPAYMENT_CRON_BATCH_SIZE,
  ORDER_PREPAYMENT_DEADLINE_MS,
  ORDER_PREPAYMENT_REMINDER_BEFORE_MS,
  ORDER_STATUS_PENDING,
  ORDER_TERMINAL_STATUSES,
  SELLER_ORDER_PREPAYMENT_EXPIRED_MESSAGE,
} from "../../constants/orderConstants.js";
import {
  PAYMENT_PURPOSE_ORDER,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  YOOKASSA_PAYMENT_STATUS_CANCELED,
  YOOKASSA_PAYMENT_STATUS_SUCCEEDED,
} from "../../constants/yookassaConstants.js";
import { OrderModel, PaymentModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";
import { isOrderAcceptedBySeller } from "../order/assertOrderPrepaid.js";
import { cancelOrderBySystem } from "../order/cancelOrderItems.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { applyOrderPrepayment } from "./orderPrepayment.js";
import { getYookassaPayment, isYookassaConfigured } from "./yookassaClient.js";

/**
 * Срок оплаты заказов по СБП.
 *
 * Продавец подтвердил заказ — у покупателя сутки на оплату. За 3 часа до
 * конца напоминаем, после — отменяем заказ от имени площадки, и товар
 * возвращается в продажу. Иначе неоплаченный заказ держал бы резерв вечно.
 *
 * Деньги здесь главное: отмена в ту минуту, когда покупатель как раз платит,
 * списала бы деньги за отменённый заказ. Поэтому заказ не трогаем, пока по
 * нему открыт платёж у провайдера, и ещё полчаса после последней попытки.
 */

const UNPAID_PREPAID_FILTER = {
  paymentMethod: ORDER_PAYMENT_METHOD_CARD_PREPAID,
  prepaidPaidAt: null,
  status: { $nin: ORDER_TERMINAL_STATUSES },
};

/**
 * «4 октября, 15:30» по Москве — так покупатель увидит срок в уведомлении.
 *
 * @param {Date} date
 */
export function formatPrepaymentDeadlineMsk(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(" в ", ", ");
}

/**
 * @param {{ userId: unknown; kind: string; message: string; orderId: unknown }} input
 */
async function notify({ userId, kind, message, orderId }) {
  if (!userId) return;
  try {
    await createUserInAppNotification({ userId: String(userId), kind, message });
  } catch (error) {
    logServerEvent("error", {
      event: "prepayment_deadline.notify_failed",
      orderId: String(orderId),
      ...formatLogError(error),
    });
  }
}

/**
 * Заказам, подтверждённым до появления срока, ставим сутки от этого прохода:
 * отменять их задним числом было бы нечестно.
 *
 * @param {Date} now
 */
async function backfillMissingDeadlines(now) {
  const orders = await OrderModel.find({
    ...UNPAID_PREPAID_FILTER,
    prepaymentDueAt: null,
  })
    .select("items")
    .limit(ORDER_PREPAYMENT_CRON_BATCH_SIZE)
    .lean();
  let updated = 0;
  for (const order of orders) {
    if (!isOrderAcceptedBySeller(order)) continue;
    const result = await OrderModel.updateOne(
      { _id: order._id, prepaymentDueAt: null, prepaidPaidAt: null },
      {
        $set: {
          prepaymentDueAt: new Date(now.getTime() + ORDER_PREPAYMENT_DEADLINE_MS),
        },
      },
    );
    updated += result.modifiedCount;
  }
  return updated;
}

/** @param {Date} now */
async function sendReminders(now) {
  const orders = await OrderModel.find({
    ...UNPAID_PREPAID_FILTER,
    prepaymentReminderSentAt: null,
    prepaymentDueAt: {
      $gt: now,
      $lte: new Date(now.getTime() + ORDER_PREPAYMENT_REMINDER_BEFORE_MS),
    },
  })
    .select("userBuyerId prepaymentDueAt")
    .limit(ORDER_PREPAYMENT_CRON_BATCH_SIZE)
    .lean();

  let sent = 0;
  for (const order of orders) {
    // Отметка до отправки и атомарно: два параллельных прохода не пришлют
    // покупателю два одинаковых напоминания.
    const claimed = await OrderModel.updateOne(
      { _id: order._id, prepaymentReminderSentAt: null },
      { $set: { prepaymentReminderSentAt: now } },
    );
    if (claimed.modifiedCount !== 1) continue;
    await notify({
      userId: order.userBuyerId,
      kind: IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
      message: BUYER_ORDER_PREPAYMENT_REMINDER_MESSAGE(
        formatPrepaymentDeadlineMsk(order.prepaymentDueAt),
      ),
      orderId: order._id,
    });
    sent += 1;
  }
  return sent;
}

/**
 * Можно ли отменять заказ: платёж не открыт и не идёт прямо сейчас.
 *
 * Открытый у нас платёж сверяем с провайдером: если там он уже прошёл —
 * проводим оплату (вебхук мог потеряться), а не отменяем заказ.
 *
 * @param {Record<string, any>} order
 * @param {Date} now
 * @returns {Promise<{ ok: boolean; reason?: string }>}
 */
async function resolveCancelSafety(order, now) {
  const payments = await PaymentModel.find({
    orderId: order._id,
    purpose: PAYMENT_PURPOSE_ORDER,
  })
    .select("status providerPaymentId createdAt updatedAt")
    .lean();

  if (payments.some((payment) => payment.status === PAYMENT_STATUS_SUCCEEDED)) {
    return { ok: false, reason: "paid" };
  }

  const lastAttemptMs = Math.max(
    0,
    ...payments.map((payment) =>
      Math.max(
        new Date(payment.createdAt ?? 0).getTime(),
        new Date(payment.updatedAt ?? 0).getTime(),
      ),
    ),
  );
  if (
    lastAttemptMs &&
    now.getTime() - lastAttemptMs < ORDER_PREPAYMENT_ATTEMPT_GRACE_MS
  ) {
    return { ok: false, reason: "recent_attempt" };
  }

  for (const payment of payments.filter(
    (row) => row.status === PAYMENT_STATUS_CREATED,
  )) {
    // Проверить у провайдера нечем — считаем платёж открытым: лишние сутки
    // резерва дешевле денег за отменённый заказ.
    if (!payment.providerPaymentId || !isYookassaConfigured()) {
      return { ok: false, reason: "open_payment_unverified" };
    }
    let provider;
    try {
      provider = await getYookassaPayment(payment.providerPaymentId);
    } catch (error) {
      logServerEvent("warn", {
        event: "prepayment_deadline.provider_unavailable",
        orderId: String(order._id),
        ...formatLogError(error),
      });
      return { ok: false, reason: "provider_unavailable" };
    }
    const status = String(provider?.status ?? "");
    if (status === YOOKASSA_PAYMENT_STATUS_SUCCEEDED) {
      await applyOrderPrepayment({
        paymentId: String(payment._id),
        providerStatus: status,
        providerAmountRub: Number(provider?.amount?.value),
      });
      return { ok: false, reason: "paid_upstream" };
    }
    if (status === YOOKASSA_PAYMENT_STATUS_CANCELED) {
      await applyOrderPrepayment({
        paymentId: String(payment._id),
        providerStatus: status,
        providerAmountRub: 0,
      });
      continue;
    }
    return { ok: false, reason: "open_payment" };
  }

  return { ok: true };
}

/** @param {Date} now */
async function cancelExpiredOrders(now) {
  const orders = await OrderModel.find({
    ...UNPAID_PREPAID_FILTER,
    prepaymentDueAt: { $lte: now },
  })
    .select("_id userBuyerId items status")
    .limit(ORDER_PREPAYMENT_CRON_BATCH_SIZE)
    .lean();

  let cancelled = 0;
  let deferred = 0;
  for (const order of orders) {
    // Продавец ещё не подтвердил (или вернул в «новый») — оплата закрыта, и
    // срок не идёт. Такой заказ отменяет продавец сам.
    if ((order.items ?? []).every((item) => item.status === ORDER_STATUS_PENDING)) {
      continue;
    }
    try {
      const safety = await resolveCancelSafety(order, now);
      if (!safety.ok) {
        deferred += 1;
        logServerEvent("info", {
          event: "prepayment_deadline.deferred",
          orderId: String(order._id),
          reason: safety.reason,
        });
        continue;
      }

      const result = await cancelOrderBySystem({ orderId: String(order._id) });
      if (result.cancelledCount === 0) continue;
      await OrderModel.updateOne(
        { _id: order._id },
        { $set: { prepaymentExpiredAt: now } },
      );
      cancelled += 1;

      logMoneyEvent("info", "order_prepayment_expired", {
        userId: String(order.userBuyerId),
        orderId: String(order._id),
        items: result.cancelledCount,
      });
      await notify({
        userId: order.userBuyerId,
        kind: IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
        message: BUYER_ORDER_PREPAYMENT_EXPIRED_MESSAGE,
        orderId: order._id,
      });
      for (const sellerId of result.sellerIds) {
        await notify({
          userId: sellerId,
          kind: IN_APP_NOTIFICATION_KIND_SELLER_NEW_ORDER,
          message: SELLER_ORDER_PREPAYMENT_EXPIRED_MESSAGE,
          orderId: order._id,
        });
      }
    } catch (error) {
      // Один сломанный заказ не должен останавливать остальные.
      logServerEvent("error", {
        event: "prepayment_deadline.cancel_failed",
        orderId: String(order._id),
        ...formatLogError(error),
      });
    }
  }
  return { cancelled, deferred };
}

/**
 * Один проход крона.
 *
 * @param {{ now?: Date }} [options]
 */
export async function processOrderPrepaymentDeadlines({ now = new Date() } = {}) {
  const backfilled = await backfillMissingDeadlines(now);
  const reminded = await sendReminders(now);
  const { cancelled, deferred } = await cancelExpiredOrders(now);
  return { backfilled, reminded, cancelled, deferred };
}
