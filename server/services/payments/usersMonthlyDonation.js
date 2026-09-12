import { randomUUID } from "node:crypto";

import {
  PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
  PAYMENT_STATUS_CANCELED,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  USERS_MONTHLY_DONATION_DAILY_LIMIT,
  USERS_MONTHLY_DONATION_MAX_RUB,
  USERS_MONTHLY_DONATION_MIN_RUB,
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
import { resolveMoscowCalendarDayUtcRange } from "../loyalty/moscowCalendarMonth.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";
import { resolveReusablePayment } from "./paymentIdempotency.js";
import { buildReturnUrl } from "./paymentReturnUrl.js";
import { createYookassaPayment, isYookassaConfigured } from "./yookassaClient.js";

/**
 * @param {unknown} raw
 * @returns {number}
 */
function normalizeDonationAmountRub(raw) {
  const rub = Math.floor(Number(raw));
  if (!Number.isFinite(rub) || rub < USERS_MONTHLY_DONATION_MIN_RUB) {
    throw new AppError(
      400,
      `Минимальная сумма пожертвования — ${USERS_MONTHLY_DONATION_MIN_RUB} ₽`,
    );
  }
  if (rub > USERS_MONTHLY_DONATION_MAX_RUB) {
    throw new AppError(
      400,
      `Максимальная сумма пожертвования — ${USERS_MONTHLY_DONATION_MAX_RUB} ₽`,
    );
  }
  return rub;
}

/**
 * @param {{ amountRub: number; email: string; phone: string }} input
 */
function buildDonationReceipt({ amountRub, email, phone }) {
  const customer = {};
  if (email) customer.email = email;
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 11) customer.phone = `7${digits.slice(1)}`;

  if (!customer.email && !customer.phone) {
    throw new AppError(400, "Для чека нужен email или телефон — добавьте их в профиле");
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
        description: "Пожертвование Gitorg",
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
 * @param {{ userId: string; referenceDate?: Date }} input
 * @returns {Promise<number>}
 */
export async function countSucceededUsersMonthlyDonationsToday({
  userId,
  referenceDate = new Date(),
}) {
  const { startUtc, endUtc } = resolveMoscowCalendarDayUtcRange(referenceDate);
  return PaymentModel.countDocuments({
    userId,
    purpose: PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
    status: PAYMENT_STATUS_SUCCEEDED,
    appliedAt: { $gte: startUtc, $lt: endUtc },
  });
}

/**
 * @param {{ userId: string; amountRub: unknown; returnUrl: string; idempotencyKey?: string }} input
 */
export async function createUsersMonthlyDonation({
  userId,
  amountRub,
  returnUrl,
  idempotencyKey,
}) {
  if (!isYookassaConfigured()) {
    throw new AppError(503, YOOKASSA_NOT_CONFIGURED_MESSAGE);
  }

  const rub = normalizeDonationAmountRub(amountRub);
  const user = await UserModel.findById(userId).select("email userPhoneNumber").lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const succeededToday = await countSucceededUsersMonthlyDonationsToday({ userId });
  if (succeededToday >= USERS_MONTHLY_DONATION_DAILY_LIMIT) {
    throw new AppError(
      429,
      `Лимит пожертвований на сегодня — ${USERS_MONTHLY_DONATION_DAILY_LIMIT}. Попробуйте завтра.`,
    );
  }

  const key = String(idempotencyKey ?? "").trim() || randomUUID();
  const existing = await resolveReusablePayment({
    userId,
    idempotenceKey: key,
    purpose: PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
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

  const receipt = buildDonationReceipt({
    amountRub: rub,
    email: String(user.email ?? "").trim(),
    phone: String(user.userPhoneNumber ?? "").trim(),
  });

  const payment = await PaymentModel.create({
    userId,
    purpose: PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
    amountRub: rub,
    status: PAYMENT_STATUS_CREATED,
    idempotenceKey: key,
  });

  let providerPayment;
  try {
    providerPayment = await createYookassaPayment({
      amountRub: rub,
      description: `Пожертвование Gitorg на ${rub} ₽`,
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

  logMoneyEvent("info", "users_monthly_donation_created", {
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
 * Успешная оплата только фиксирует платёж: баллы пользователю не начисляем.
 * Сумма попадёт в месячный прогресс через агрегацию succeeded-платежей.
 *
 * @param {{ paymentId: string; providerStatus: string; providerAmountRub: number }} input
 */
export async function applyUsersMonthlyDonation({
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
    {
      $set: {
        status: PAYMENT_STATUS_SUCCEEDED,
        appliedAt: new Date(),
        appliedAmount: Math.floor(Number(payment.amountRub)),
      },
    },
    { returnDocument: "after" },
  ).lean();

  if (!claimed) {
    return { applied: false, reason: "already_applied" };
  }

  logMoneyEvent("info", "users_monthly_donation_applied", {
    userId: String(payment.userId),
    amount: claimed.appliedAmount,
    currency: "RUB",
    paymentId: String(payment._id),
  });

  return { applied: true, donatedRub: claimed.appliedAmount };
}

/**
 * @param {{ startUtc: Date; endUtc: Date }} range
 * @returns {Promise<number>}
 */
export async function sumUsersMonthlyDonationsInRange({ startUtc, endUtc }) {
  const rows = await PaymentModel.aggregate([
    {
      $match: {
        purpose: PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
        status: PAYMENT_STATUS_SUCCEEDED,
        appliedAt: { $gte: startUtc, $lt: endUtc },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ["$appliedAmount", 0] } },
      },
    },
  ]);

  return Math.max(0, Math.floor(Number(rows[0]?.total) || 0));
}
