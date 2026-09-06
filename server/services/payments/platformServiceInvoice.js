import { randomUUID } from "node:crypto";

import {
  PAYMENT_PURPOSE_PLATFORM_SERVICE,
  PAYMENT_STATUS_CANCELED,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  PLATFORM_SERVICE_KINDS,
  YOOKASSA_NOT_CONFIGURED_MESSAGE,
  YOOKASSA_PAYMENT_STATUS_CANCELED,
  YOOKASSA_PAYMENT_STATUS_SUCCEEDED,
  YOOKASSA_POINTS_PAYMENT_MODE,
  YOOKASSA_SERVICE_PAYMENT_SUBJECT,
  YOOKASSA_TAX_SYSTEM_CODE_DEFAULT,
  YOOKASSA_VAT_CODE_DEFAULT,
} from "../../constants/yookassaConstants.js";
import { AppError } from "../../errors/AppError.js";
import { PaymentModel, UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";
import { resolveReusablePayment } from "./paymentIdempotency.js";
import { buildReturnUrl } from "./paymentReturnUrl.js";
import { createYookassaPayment, isYookassaConfigured } from "./yookassaClient.js";

export const PLATFORM_SERVICE_NOT_PAYABLE_MESSAGE =
  "Эту услугу сейчас нельзя оплатить: она ещё не одобрена или уже оплачена";

export const PLATFORM_SERVICE_UNKNOWN_KIND_MESSAGE = "Неизвестная услуга площадки";

/**
 * Услуги площадки, оплачиваемые счётом.
 *
 * Каждая подсистема регистрирует здесь две функции: как выставить счёт и что
 * включить после оплаты. Реестр нужен, чтобы платёжный слой ничего не знал про
 * продвижение и рекламу — иначе он оброс бы ветками на каждую новую услугу.
 *
 * @type {Map<string, {
 *   loadPayable: (targetId: string, userId: string) => Promise<{ amountRub: number; description: string } | null>;
 *   activate: (targetId: string, paymentId: string) => Promise<void>;
 * }>}
 */
const serviceHandlers = new Map();

/**
 * @param {string} kind
 * @param {{
 *   loadPayable: (targetId: string, userId: string) => Promise<{ amountRub: number; description: string } | null>;
 *   activate: (targetId: string, paymentId: string) => Promise<void>;
 * }} handler
 */
export function registerPlatformServiceHandler(kind, handler) {
  if (!PLATFORM_SERVICE_KINDS.includes(kind)) {
    throw new Error(`Unknown platform service kind: ${kind}`);
  }
  serviceHandlers.set(kind, handler);
}

/** @param {string} kind */
export function getPlatformServiceHandler(kind) {
  return serviceHandlers.get(kind) ?? null;
}

/**
 * @param {{ amountRub: number; description: string; email: string; phone: string }} input
 */
function buildServiceReceipt({ amountRub, description, email, phone }) {
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
        description: String(description).slice(0, 128),
        quantity: (1).toFixed(2),
        amount: { value: Number(amountRub).toFixed(2), currency: "RUB" },
        vat_code: vatCode,
        // Продвижение и реклама — услуга площадки, а не товар.
        payment_subject: YOOKASSA_SERVICE_PAYMENT_SUBJECT,
        payment_mode: YOOKASSA_POINTS_PAYMENT_MODE,
      },
    ],
  };
}

/**
 * Выставить счёт на услугу площадки и увести пользователя на оплату по СБП.
 *
 * Сумму берём из самой услуги, а не из запроса: цену считает площадка, иначе
 * продвижение можно было бы купить за рубль, подправив тело запроса.
 *
 * @param {{
 *   userId: string;
 *   serviceKind: string;
 *   targetId: string;
 *   returnUrl: string;
 *   idempotencyKey?: string;
 * }} input
 */
export async function createPlatformServicePayment({
  userId,
  serviceKind,
  targetId,
  returnUrl,
  idempotencyKey,
}) {
  if (!isYookassaConfigured()) {
    throw new AppError(503, YOOKASSA_NOT_CONFIGURED_MESSAGE);
  }

  const handler = getPlatformServiceHandler(serviceKind);
  if (!handler) {
    throw new AppError(400, PLATFORM_SERVICE_UNKNOWN_KIND_MESSAGE);
  }

  // Заодно проверяет, что услуга принадлежит этому пользователю и ждёт оплаты.
  const payable = await handler.loadPayable(targetId, userId);
  if (!payable) {
    throw new AppError(409, PLATFORM_SERVICE_NOT_PAYABLE_MESSAGE);
  }

  const amountRub = Math.max(0, Math.round(Number(payable.amountRub) || 0));
  if (amountRub <= 0) {
    throw new AppError(400, "Сумма услуги должна быть больше 0");
  }

  const key = String(idempotencyKey ?? "").trim() || randomUUID();
  const existing = await resolveReusablePayment({
    userId,
    idempotenceKey: key,
    purpose: PAYMENT_PURPOSE_PLATFORM_SERVICE,
    amountRub,
    serviceKind,
    serviceTargetId: targetId,
  });
  if (existing) {
    return {
      paymentId: String(existing._id),
      confirmationUrl: existing.confirmationUrl,
      amountRub: existing.amountRub,
    };
  }

  const user = await UserModel.findById(userId).select("email userPhoneNumber").lean();
  const receipt = buildServiceReceipt({
    amountRub,
    description: payable.description,
    email: String(user?.email ?? "").trim(),
    phone: String(user?.userPhoneNumber ?? "").trim(),
  });

  // Запись до похода в банк: потерянный ответ не должен оставить деньги без
  // следа у нас.
  const payment = await PaymentModel.create({
    userId,
    purpose: PAYMENT_PURPOSE_PLATFORM_SERVICE,
    serviceKind,
    serviceTargetId: targetId,
    amountRub,
    status: PAYMENT_STATUS_CREATED,
    idempotenceKey: key,
  });

  let providerPayment;
  try {
    providerPayment = await createYookassaPayment({
      amountRub,
      description: payable.description,
      returnUrl: buildReturnUrl(returnUrl),
      idempotenceKey: key,
      metadata: {
        paymentId: String(payment._id),
        userId: String(userId),
        serviceKind,
      },
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

  logMoneyEvent("info", "platform_service_payment_created", {
    userId: String(userId),
    serviceKind,
    targetId: String(targetId),
    amount: amountRub,
    currency: "RUB",
    paymentId: String(payment._id),
  });

  return { paymentId: String(payment._id), confirmationUrl, amountRub };
}

/**
 * Оплата прошла — включаем услугу.
 *
 * Форма ответа та же, что у остальных обработчиков целей платежа: вебхук и
 * догоняющая синхронизация вызывают их одинаково.
 *
 * @param {{ paymentId: string; providerStatus: string; providerAmountRub: number }} input
 */
export async function applyPlatformServicePayment({
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

  // Гонка вебхука и возврата пользователя разрешается здесь: услугу включает
  // тот, кто первым перевёл платёж в succeeded.
  const claimed = await PaymentModel.findOneAndUpdate(
    { _id: payment._id, status: PAYMENT_STATUS_CREATED },
    { $set: { status: PAYMENT_STATUS_SUCCEEDED, appliedAt: new Date() } },
    { returnDocument: "after" },
  ).lean();

  if (!claimed) {
    return { applied: false, reason: "already_applied" };
  }

  const handler = getPlatformServiceHandler(String(payment.serviceKind ?? ""));
  if (!handler) {
    logServerEvent("error", {
      event: "payment.service_handler_missing",
      paymentId: String(payment._id),
      serviceKind: payment.serviceKind,
    });
    return { applied: false, reason: "purpose_unsupported" };
  }

  try {
    await handler.activate(String(payment.serviceTargetId), String(payment._id));
  } catch (error) {
    // Деньги уже наши, услуга — нет. Откатывать платёж нельзя, поэтому громко
    // логируем: такой случай разбирают руками.
    logServerEvent("error", {
      event: "payment.service_activation_failed",
      paymentId: String(payment._id),
      serviceKind: payment.serviceKind,
      targetId: String(payment.serviceTargetId),
      ...formatLogError(error),
    });
    return { applied: false, reason: "activation_failed" };
  }

  logMoneyEvent("info", "platform_service_paid", {
    userId: String(payment.userId),
    serviceKind: payment.serviceKind,
    targetId: String(payment.serviceTargetId),
    amount: payment.amountRub,
    currency: "RUB",
    paymentId: String(payment._id),
  });

  return { applied: true, serviceKind: payment.serviceKind };
}
