import {
  PAYMENT_PURPOSE_LOYALTY_POINTS,
  YOOKASSA_WEBHOOK_EVENTS,
} from "../../constants/yookassaConstants.js";
import { PaymentModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { applyLoyaltyPointsTopUp } from "./loyaltyPointsTopUp.js";
import { getYookassaPayment } from "./yookassaClient.js";

/**
 * Обработать уведомление ЮKassa.
 *
 * Телу уведомления не верим ни в чём, кроме `object.id`: подписи у ЮKassa нет,
 * и любой, кто узнал адрес, мог бы прислать «платёж на миллион успешен».
 * Поэтому статус и сумму берём из ответа API на перезапрос платежа.
 *
 * Возвращаем результат, но наружу контроллер всегда отвечает 200: на любой
 * другой код ЮKassa будет слать уведомление повторно сутками, а разбирать
 * наши внутренние сбои повторами бессмысленно.
 *
 * @param {unknown} body
 */
export async function handleYookassaNotification(body) {
  const event = String(body?.event ?? "");
  const providerPaymentId = String(body?.object?.id ?? "").trim();

  if (!YOOKASSA_WEBHOOK_EVENTS.includes(event)) {
    return { handled: false, reason: "event_ignored" };
  }
  if (!providerPaymentId) {
    return { handled: false, reason: "no_payment_id" };
  }

  const payment = await PaymentModel.findOne({ providerPaymentId }).lean();
  if (!payment) {
    // Чужой магазин, тестовый платёж или гонка с созданием — не наша забота.
    logServerEvent("warn", {
      event: "yookassa.webhook_unknown_payment",
      providerPaymentId,
    });
    return { handled: false, reason: "unknown_payment" };
  }

  let providerPayment;
  try {
    providerPayment = await getYookassaPayment(providerPaymentId);
  } catch (error) {
    logServerEvent("error", {
      event: "yookassa.webhook_fetch_failed",
      providerPaymentId,
      ...formatLogError(error),
    });
    return { handled: false, reason: "fetch_failed" };
  }

  const providerStatus = String(providerPayment?.status ?? "");
  const providerAmountRub = Number(providerPayment?.amount?.value ?? 0);

  if (payment.purpose === PAYMENT_PURPOSE_LOYALTY_POINTS) {
    const result = await applyLoyaltyPointsTopUp({
      paymentId: String(payment._id),
      providerStatus,
      providerAmountRub,
    });
    return { handled: true, ...result };
  }

  return { handled: false, reason: "purpose_unsupported" };
}

/**
 * Догнать статус платежа по возвращении пользователя на сайт.
 *
 * Уведомление обычно успевает раньше, но если оно застряло, покупатель не
 * должен смотреть на «ожидает оплаты» с уже списанными деньгами.
 *
 * @param {{ userId: string; paymentId: string }} input
 */
export async function syncPaymentForUser({ userId, paymentId }) {
  const payment = await PaymentModel.findOne({ _id: paymentId, userId }).lean();
  if (!payment) {
    return null;
  }

  if (payment.status === "created" && payment.providerPaymentId) {
    try {
      const providerPayment = await getYookassaPayment(payment.providerPaymentId);
      if (payment.purpose === PAYMENT_PURPOSE_LOYALTY_POINTS) {
        await applyLoyaltyPointsTopUp({
          paymentId: String(payment._id),
          providerStatus: String(providerPayment?.status ?? ""),
          providerAmountRub: Number(providerPayment?.amount?.value ?? 0),
        });
      }
    } catch (error) {
      logServerEvent("warn", {
        event: "payment.sync_failed",
        paymentId: String(payment._id),
        ...formatLogError(error),
      });
    }
  }

  const fresh = await PaymentModel.findById(payment._id).lean();
  return {
    paymentId: String(fresh._id),
    status: fresh.status,
    amountRub: fresh.amountRub,
    creditedPoints: fresh.appliedAmount ?? 0,
  };
}
