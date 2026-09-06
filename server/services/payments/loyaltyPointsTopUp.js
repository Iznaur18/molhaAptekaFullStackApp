import { randomUUID } from "node:crypto";

import {
  LOYALTY_POINTS_TOPUP_MAX_RUB,
  LOYALTY_POINTS_TOPUP_MIN_RUB,
  PAYMENT_PURPOSE_LOYALTY_POINTS,
  PAYMENT_STATUS_CANCELED,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  YOOKASSA_NOT_CONFIGURED_MESSAGE,
  YOOKASSA_PAYMENT_STATUS_CANCELED,
  YOOKASSA_PAYMENT_STATUS_SUCCEEDED,
  YOOKASSA_POINTS_PAYMENT_MODE,
  YOOKASSA_POINTS_PAYMENT_SUBJECT,
  YOOKASSA_TAX_SYSTEM_CODE_DEFAULT,
  YOOKASSA_VAT_CODE_DEFAULT,
} from "../../constants/yookassaConstants.js";
import { AppError } from "../../errors/AppError.js";
import { PaymentModel, UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { creditLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";
import { resolveReusablePayment } from "./paymentIdempotency.js";
import { buildReturnUrl } from "./paymentReturnUrl.js";
import { createYookassaPayment, isYookassaConfigured } from "./yookassaClient.js";

/** 1 ₽ = 1 балл — как в `loyaltyPointsConstants.js` на клиенте. */
const rublesToPoints = (rub) => Math.ceil(Number(rub));

/**
 * @param {unknown} raw
 * @returns {number}
 */
function normalizeTopUpAmountRub(raw) {
  const rub = Math.floor(Number(raw));
  if (!Number.isFinite(rub) || rub < LOYALTY_POINTS_TOPUP_MIN_RUB) {
    throw new AppError(400, `Минимальная сумма пополнения — ${LOYALTY_POINTS_TOPUP_MIN_RUB} ₽`);
  }
  if (rub > LOYALTY_POINTS_TOPUP_MAX_RUB) {
    throw new AppError(400, `Максимальная сумма пополнения — ${LOYALTY_POINTS_TOPUP_MAX_RUB} ₽`);
  }
  return rub;
}

/**
 * Чек по 54-ФЗ. Пробивает ЮKassa, от нас — состав и контакт покупателя.
 *
 * Баллы — предоплата за услуги площадки, поэтому предмет расчёта `payment`,
 * а не товар.
 *
 * @param {{ amountRub: number; email: string; phone: string }} input
 */
function buildLoyaltyPointsReceipt({ amountRub, email, phone }) {
  const customer = {};
  if (email) customer.email = email;
  // Телефон в чеке — только цифры с ведущей 7.
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 11) customer.phone = `7${digits.slice(1)}`;

  if (!customer.email && !customer.phone) {
    throw new AppError(
      400,
      "Для чека нужен email или телефон — добавьте их в профиле",
    );
  }

  const taxSystemCode =
    Math.floor(Number(process.env.YOOKASSA_TAX_SYSTEM_CODE)) ||
    YOOKASSA_TAX_SYSTEM_CODE_DEFAULT;
  const vatCode =
    Math.floor(Number(process.env.YOOKASSA_VAT_CODE)) || YOOKASSA_VAT_CODE_DEFAULT;

  return {
    customer,
    tax_system_code: taxSystemCode,
    items: [
      {
        description: "Баллы Gitorg",
        quantity: "1.00",
        amount: { value: Number(amountRub).toFixed(2), currency: "RUB" },
        vat_code: vatCode,
        payment_subject: YOOKASSA_POINTS_PAYMENT_SUBJECT,
        payment_mode: YOOKASSA_POINTS_PAYMENT_MODE,
      },
    ],
  };
}


/**
 * Создать платёж на пополнение баллов и вернуть ссылку на оплату.
 *
 * Баллы здесь не начисляются: это делает только подтверждённый платёж в
 * `applyLoyaltyPointsTopUp`, иначе достаточно было бы открыть форму оплаты.
 *
 * @param {{ userId: string; amountRub: unknown; returnUrl: string; idempotencyKey?: string }} input
 */
export async function createLoyaltyPointsTopUp({
  userId,
  amountRub,
  returnUrl,
  idempotencyKey,
}) {
  if (!isYookassaConfigured()) {
    throw new AppError(503, YOOKASSA_NOT_CONFIGURED_MESSAGE);
  }

  const rub = normalizeTopUpAmountRub(amountRub);
  const user = await UserModel.findById(userId).select("email userPhoneNumber").lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const key = String(idempotencyKey ?? "").trim() || randomUUID();

  // Повтор с тем же ключом отдаёт ту же ссылку, а не второй платёж. Ключ
  // сверяется вместе с целью и суммой: у пополнения нет объекта, за который
  // платят, и одна пара «пользователь + ключ» ничего не доказывает.
  const existing = await resolveReusablePayment({
    userId,
    idempotenceKey: key,
    purpose: PAYMENT_PURPOSE_LOYALTY_POINTS,
    amountRub: rub,
  });
  if (existing) {
    return {
      paymentId: String(existing._id),
      confirmationUrl: existing.confirmationUrl,
      amountRub: existing.amountRub,
      duplicate: true,
    };
  }

  const receipt = buildLoyaltyPointsReceipt({
    amountRub: rub,
    email: String(user.email ?? "").trim(),
    phone: String(user.userPhoneNumber ?? "").trim(),
  });

  // Запись создаём до похода в банк: если ответ потеряется в сети, платёж
  // всё равно найдётся по ключу, а не повиснет деньгами без следа у нас.
  const payment = await PaymentModel.create({
    userId,
    purpose: PAYMENT_PURPOSE_LOYALTY_POINTS,
    amountRub: rub,
    status: PAYMENT_STATUS_CREATED,
    idempotenceKey: key,
  });

  let providerPayment;
  try {
    providerPayment = await createYookassaPayment({
      amountRub: rub,
      description: `Баллы Gitorg на ${rub} ₽`,
      returnUrl: buildReturnUrl(returnUrl),
      idempotenceKey: key,
      metadata: { paymentId: String(payment._id), userId: String(userId) },
      receipt,
    });
  } catch (error) {
    await PaymentModel.deleteOne({ _id: payment._id, status: PAYMENT_STATUS_CREATED });
    throw error;
  }

  const confirmationUrl = String(providerPayment?.confirmation?.confirmation_url ?? "");
  await PaymentModel.updateOne(
    { _id: payment._id },
    {
      $set: {
        providerPaymentId: String(providerPayment?.id ?? ""),
        confirmationUrl,
      },
    },
  );

  logMoneyEvent("info", "loyalty_topup_created", {
    userId: String(userId),
    amount: rub,
    currency: "RUB",
    paymentId: String(payment._id),
  });

  return {
    paymentId: String(payment._id),
    confirmationUrl,
    amountRub: rub,
  };
}

/**
 * Применить результат платежа к балансу.
 *
 * Вызывается из обработчика уведомлений и при возврате пользователя на сайт.
 * Начисление ровно одно: его сторожит переход `created → succeeded` в одном
 * атомарном обновлении, а не проверка «а не начисляли ли мы уже».
 *
 * @param {{ paymentId: string; providerStatus: string; providerAmountRub: number }} input
 */
export async function applyLoyaltyPointsTopUp({
  paymentId,
  providerStatus,
  providerAmountRub,
}) {
  const payment = await PaymentModel.findById(paymentId).lean();
  if (!payment) {
    return { applied: false, reason: "not_found" };
  }

  if (providerStatus === YOOKASSA_PAYMENT_STATUS_CANCELED) {
    await PaymentModel.updateOne(
      { _id: payment._id, status: PAYMENT_STATUS_CREATED },
      { $set: { status: PAYMENT_STATUS_CANCELED } },
    );
    return { applied: false, reason: "canceled" };
  }

  if (providerStatus !== YOOKASSA_PAYMENT_STATUS_SUCCEEDED) {
    return { applied: false, reason: "pending" };
  }

  // Банк — источник истины по сумме: если она разошлась с нашей записью,
  // начислять нельзя, это уже разбор вручную.
  if (Math.abs(Number(providerAmountRub) - Number(payment.amountRub)) > 0.01) {
    logServerEvent("error", {
      event: "payment.amount_mismatch",
      paymentId: String(payment._id),
      expected: payment.amountRub,
      actual: providerAmountRub,
    });
    return { applied: false, reason: "amount_mismatch" };
  }

  const claimed = await PaymentModel.findOneAndUpdate(
    { _id: payment._id, status: PAYMENT_STATUS_CREATED },
    { $set: { status: PAYMENT_STATUS_SUCCEEDED, appliedAt: new Date() } },
    { returnDocument: "after" },
  ).lean();

  if (!claimed) {
    // Уведомление пришло повторно — это норма, а не ошибка.
    return { applied: false, reason: "already_applied" };
  }

  const points = rublesToPoints(payment.amountRub);
  try {
    const balance = await creditLoyaltyPoints({ userId: payment.userId, amount: points });
    await PaymentModel.updateOne(
      { _id: payment._id },
      { $set: { appliedAmount: points } },
    );
    logMoneyEvent("info", "loyalty_topup_applied", {
      userId: String(payment.userId),
      amount: points,
      currency: "LP",
      balanceAfter: balance,
      paymentId: String(payment._id),
    });
    return { applied: true, credited: points, loyaltyPointsBalance: balance };
  } catch (error) {
    // Деньги у банка уже есть, а баллы не начислились: возвращаем платёж в
    // `created`, чтобы повторное уведомление довело начисление до конца.
    await PaymentModel.updateOne(
      { _id: payment._id },
      { $set: { status: PAYMENT_STATUS_CREATED, appliedAt: null } },
    );
    logServerEvent("error", {
      event: "payment.credit_failed",
      paymentId: String(payment._id),
      ...formatLogError(error),
    });
    throw error;
  }
}
