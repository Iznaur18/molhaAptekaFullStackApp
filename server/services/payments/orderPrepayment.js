import { randomUUID } from "node:crypto";

import {
  PAYMENT_PURPOSE_ORDER,
  PAYMENT_STATUS_CANCELED,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  resolvePlatformSellerUserIds,
  YOOKASSA_NOT_CONFIGURED_MESSAGE,
  YOOKASSA_ORDER_PAYMENT_SUBJECT,
  YOOKASSA_PAYMENT_STATUS_CANCELED,
  YOOKASSA_PAYMENT_STATUS_SUCCEEDED,
  YOOKASSA_POINTS_PAYMENT_MODE,
  YOOKASSA_TAX_SYSTEM_CODE_DEFAULT,
  YOOKASSA_VAT_CODE_DEFAULT,
} from "../../constants/yookassaConstants.js";
import { AppError } from "../../errors/AppError.js";
import { OrderModel, PaymentModel, UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";
import { buildReturnUrl } from "./paymentReturnUrl.js";
import { createYookassaPayment, isYookassaConfigured } from "./yookassaClient.js";

export const ORDER_PREPAYMENT_FOREIGN_SELLER_MESSAGE =
  "Оплата картой заранее доступна только для товаров Gitorg";

export const ORDER_PREPAYMENT_ALREADY_PAID_MESSAGE = "Заказ уже оплачен";

/**
 * Все ли продавцы заказа — площадка.
 *
 * Деньги за чужой товар на счёт площадки — это уже агентская схема со
 * сплитом, а не эквайринг. Пока сплита нет, такие заказы картой не платятся.
 *
 * @param {{ sellerId: unknown }[]} sellerRefs
 */
export function areAllSellersPlatformOwned(sellerRefs) {
  const platformIds = new Set(resolvePlatformSellerUserIds());
  if (platformIds.size === 0) {
    return false;
  }
  const ids = sellerRefs
    .map((ref) => (ref?.sellerId == null ? "" : String(ref.sellerId)))
    .filter(Boolean);
  if (ids.length === 0) {
    return false;
  }
  return ids.every((id) => platformIds.has(id));
}

/** Доступна ли предоплата картой прямо сейчас. */
export function isOrderPrepaymentAvailable() {
  return isYookassaConfigured() && resolvePlatformSellerUserIds().length > 0;
}

/**
 * @param {{ items: { productNameAtOrder?: string; priceAtOrder?: number; quantity?: number }[]; totalAmount: number }} order
 * @param {{ email: string; phone: string }} contact
 */
function buildOrderReceipt(order, contact) {
  const customer = {};
  if (contact.email) customer.email = contact.email;
  const digits = String(contact.phone ?? "").replace(/\D/g, "");
  if (digits.length === 11) customer.phone = `7${digits.slice(1)}`;

  if (!customer.email && !customer.phone) {
    throw new AppError(400, "Для чека нужен email или телефон — добавьте их в профиле");
  }

  const taxSystemCode =
    Math.floor(Number(process.env.YOOKASSA_TAX_SYSTEM_CODE)) ||
    YOOKASSA_TAX_SYSTEM_CODE_DEFAULT;
  const vatCode =
    Math.floor(Number(process.env.YOOKASSA_VAT_CODE)) || YOOKASSA_VAT_CODE_DEFAULT;

  const items = (Array.isArray(order.items) ? order.items : []).map((item) => {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const unitPrice = Number(item.priceAtOrder) || 0;
    return {
      description: String(item.productNameAtOrder ?? "Товар").slice(0, 128),
      quantity: quantity.toFixed(2),
      amount: { value: unitPrice.toFixed(2), currency: "RUB" },
      vat_code: vatCode,
      payment_subject: YOOKASSA_ORDER_PAYMENT_SUBJECT,
      payment_mode: YOOKASSA_POINTS_PAYMENT_MODE,
    };
  });

  if (items.length === 0) {
    throw new AppError(400, "В заказе нет позиций для чека");
  }

  return { customer, tax_system_code: taxSystemCode, items };
}

/**
 * Создать платёж на предоплату заказа.
 *
 * @param {{ userId: string; orderId: string; returnUrl: string; idempotencyKey?: string }} input
 */
export async function createOrderPrepayment({
  userId,
  orderId,
  returnUrl,
  idempotencyKey,
}) {
  if (!isYookassaConfigured()) {
    throw new AppError(503, YOOKASSA_NOT_CONFIGURED_MESSAGE);
  }

  // Покупатель в заказе — `userBuyerId`; чужой заказ оплатить нельзя.
  const order = await OrderModel.findOne({ _id: orderId, userBuyerId: userId }).lean();
  if (!order) {
    throw new AppError(404, "Заказ не найден");
  }
  if (order.prepaidPaidAt) {
    throw new AppError(409, ORDER_PREPAYMENT_ALREADY_PAID_MESSAGE);
  }

  // Проверяем по позициям заказа, а не по корзине: между чекаутом и оплатой
  // корзина могла измениться, а платить надо ровно за то, что заказано.
  const sellerRefs = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    sellerId: item.sellerIdAtOrder,
  }));
  if (!areAllSellersPlatformOwned(sellerRefs)) {
    throw new AppError(400, ORDER_PREPAYMENT_FOREIGN_SELLER_MESSAGE);
  }

  const amountRub = Number(order.totalAmount) || 0;
  if (amountRub <= 0) {
    throw new AppError(400, "Сумма заказа должна быть больше 0");
  }

  const key = String(idempotencyKey ?? "").trim() || randomUUID();
  const existing = await PaymentModel.findOne({ userId, idempotenceKey: key }).lean();
  if (existing) {
    return {
      paymentId: String(existing._id),
      confirmationUrl: existing.confirmationUrl,
      amountRub: existing.amountRub,
      duplicate: true,
    };
  }

  const user = await UserModel.findById(userId).select("email userPhoneNumber").lean();
  const receipt = buildOrderReceipt(order, {
    email: String(user?.email ?? "").trim(),
    phone: String(user?.userPhoneNumber ?? "").trim(),
  });

  const payment = await PaymentModel.create({
    userId,
    orderId: order._id,
    purpose: PAYMENT_PURPOSE_ORDER,
    amountRub,
    status: PAYMENT_STATUS_CREATED,
    idempotenceKey: key,
  });

  let providerPayment;
  try {
    providerPayment = await createYookassaPayment({
      amountRub,
      description: `Заказ Gitorg №${String(order._id).slice(-6)}`,
      returnUrl: buildReturnUrl(returnUrl),
      idempotenceKey: key,
      metadata: { paymentId: String(payment._id), orderId: String(order._id) },
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

  logMoneyEvent("info", "order_prepayment_created", {
    userId: String(userId),
    orderId: String(order._id),
    amount: amountRub,
    currency: "RUB",
    paymentId: String(payment._id),
  });

  return { paymentId: String(payment._id), confirmationUrl, amountRub };
}

/**
 * Отметить заказ оплаченным по результату платежа.
 *
 * Как и у баллов, отметка ровно одна: её сторожит атомарный переход
 * `created → succeeded` у платежа, а не проверка «а не отмечали ли мы уже».
 *
 * @param {{ paymentId: string; providerStatus: string; providerAmountRub: number }} input
 */
export async function applyOrderPrepayment({
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
    { $set: { status: PAYMENT_STATUS_SUCCEEDED, appliedAt: new Date() } },
    { returnDocument: "after" },
  ).lean();

  if (!claimed) {
    return { applied: false, reason: "already_applied" };
  }

  try {
    await OrderModel.updateOne(
      { _id: payment.orderId },
      { $set: { prepaidPaidAt: new Date(), prepaidPaymentId: payment._id } },
    );
    logMoneyEvent("info", "order_prepayment_applied", {
      userId: String(payment.userId),
      orderId: String(payment.orderId),
      amount: payment.amountRub,
      currency: "RUB",
      paymentId: String(payment._id),
    });
    return { applied: true, orderId: String(payment.orderId) };
  } catch (error) {
    // Деньги у банка есть, а заказ не отмечен: возвращаем платёж в `created`,
    // чтобы повторное уведомление довело дело до конца.
    await PaymentModel.updateOne(
      { _id: payment._id },
      { $set: { status: PAYMENT_STATUS_CREATED, appliedAt: null } },
    );
    logServerEvent("error", {
      event: "payment.order_mark_failed",
      paymentId: String(payment._id),
      ...formatLogError(error),
    });
    throw error;
  }
}
