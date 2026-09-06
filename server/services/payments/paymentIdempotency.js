import {
  PAYMENT_PURPOSE_ORDER,
  PAYMENT_PURPOSE_PLATFORM_SERVICE,
  PAYMENT_STATUS_CANCELED,
  PAYMENT_STATUS_CREATED,
  YOOKASSA_PAYMENT_STATUS_CANCELED,
} from "../../constants/yookassaConstants.js";
import { AppError } from "../../errors/AppError.js";
import { PaymentModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { getYookassaPayment } from "./yookassaClient.js";

export const PAYMENT_INTENT_CONFLICT_MESSAGE =
  "Этот запрос уже создал другой платёж — обновите страницу и попробуйте снова";

/**
 * За что платят: цель плюс то, за что именно.
 *
 * У пополнения баллов цели нет — каждое пополнение самостоятельно, и повтор
 * различается только ключом идемпотентности.
 *
 * @param {{
 *   purpose: string;
 *   orderId?: unknown;
 *   serviceKind?: string | null;
 *   serviceTargetId?: unknown;
 * }} intent
 * @returns {Record<string, unknown> | null}
 */
export function buildPaymentTargetFilter({
  purpose,
  orderId = null,
  serviceKind = null,
  serviceTargetId = null,
}) {
  if (purpose === PAYMENT_PURPOSE_ORDER && orderId) {
    return { purpose, orderId };
  }
  if (purpose === PAYMENT_PURPOSE_PLATFORM_SERVICE && serviceTargetId) {
    return { purpose, serviceKind, serviceTargetId };
  }
  return null;
}

/**
 * Совпадает ли найденный платёж с тем, за что платят сейчас.
 *
 * @param {Record<string, any>} payment
 * @param {Record<string, any>} intent
 */
function matchesIntent(payment, intent) {
  if (String(payment.purpose) !== String(intent.purpose)) {
    return false;
  }
  if (Math.abs(Number(payment.amountRub) - Number(intent.amountRub)) > 0.01) {
    return false;
  }
  const same = (a, b) => String(a ?? "") === String(b ?? "");
  return (
    same(payment.orderId, intent.orderId) &&
    same(payment.serviceKind, intent.serviceKind) &&
    same(payment.serviceTargetId, intent.serviceTargetId)
  );
}

/**
 * Открытый платёж больше не открыт у провайдера — закрываем и у себя.
 *
 * Иначе отменённый счёт навсегда занимал бы место единственного открытого по
 * заказу, и заплатить по нему стало бы нельзя ничем.
 *
 * @param {Record<string, any>} payment
 * @returns {Promise<boolean>} true — платёж ещё живой и его можно отдать
 */
async function isStillPayable(payment) {
  if (!payment.providerPaymentId) {
    // Ответ провайдера не успел записаться: это гонка двух одновременных
    // запросов, а не годная ссылка. Пусть второй создаёт свой платёж —
    // от второго счёта на тот же заказ страхует уникальный индекс.
    return false;
  }

  let providerPayment;
  try {
    providerPayment = await getYookassaPayment(payment.providerPaymentId);
  } catch (error) {
    // Провайдер недоступен — отдаём что есть. Ссылка скорее всего живая, а
    // создавать второй счёт вслепую заведомо хуже.
    logServerEvent("warn", {
      event: "payment.reuse_status_unknown",
      paymentId: String(payment._id),
      ...formatLogError(error),
    });
    return true;
  }

  if (String(providerPayment?.status ?? "") !== YOOKASSA_PAYMENT_STATUS_CANCELED) {
    return true;
  }

  await PaymentModel.updateOne(
    { _id: payment._id, status: PAYMENT_STATUS_CREATED },
    { $set: { status: PAYMENT_STATUS_CANCELED } },
  );
  logServerEvent("info", {
    event: "payment.reuse_canceled_upstream",
    paymentId: String(payment._id),
  });
  return false;
}

/**
 * Платёж, который надо отдать вместо создания нового.
 *
 * Две разные защиты, и обе нужны.
 *
 * **Ключ идемпотентности** сверяется не только с пользователем, но и с целью,
 * объектом и суммой. Раньше поиск шёл по паре «пользователь + ключ», и повтор
 * с тем же ключом на другой заказ молча отдавал ссылку на оплату чужого счёта
 * — с чужой суммой.
 *
 * **Открытый счёт по тому же объекту** переиспользуется, даже если ключа нет.
 * Клиент его и не присылал: каждое нажатие «Оплатить» заводило новый платёж у
 * провайдера, и на один заказ можно было получить два оплачиваемых счёта.
 * Проверка `prepaidPaidAt` от этого не спасала — она срабатывает только после
 * подтверждения первого.
 *
 * @param {{
 *   userId: string;
 *   idempotenceKey?: string;
 *   purpose: string;
 *   amountRub: number;
 *   orderId?: unknown;
 *   serviceKind?: string | null;
 *   serviceTargetId?: unknown;
 * }} intent
 * @returns {Promise<Record<string, any> | null>}
 */
export async function resolveReusablePayment(intent) {
  const { userId, idempotenceKey = "" } = intent;

  if (idempotenceKey) {
    const byKey = await PaymentModel.findOne({
      userId,
      idempotenceKey,
    }).lean();

    if (byKey) {
      if (!matchesIntent(byKey, intent)) {
        logServerEvent("warn", {
          event: "payment.idempotency_key_conflict",
          paymentId: String(byKey._id),
          userId: String(userId),
          purpose: byKey.purpose,
        });
        throw new AppError(409, PAYMENT_INTENT_CONFLICT_MESSAGE);
      }
      return byKey;
    }
  }

  const targetFilter = buildPaymentTargetFilter(intent);
  if (!targetFilter) {
    return null;
  }

  const open = await PaymentModel.findOne({
    ...targetFilter,
    userId,
    status: PAYMENT_STATUS_CREATED,
  }).lean();

  if (!open) {
    return null;
  }

  // Сумма разошлась с открытым счётом — значит объект успел измениться.
  // Второй оплачиваемый счёт на тот же объект выставлять нельзя, поэтому
  // просим разобраться человека, а не выбираем сумму сами.
  if (!matchesIntent(open, intent)) {
    logServerEvent("error", {
      event: "payment.open_amount_mismatch",
      paymentId: String(open._id),
      expected: intent.amountRub,
      actual: open.amountRub,
    });
    throw new AppError(409, PAYMENT_INTENT_CONFLICT_MESSAGE);
  }

  return (await isStillPayable(open)) ? open : null;
}
