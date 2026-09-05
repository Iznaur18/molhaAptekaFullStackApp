import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Синхрон с `server/constants/yookassaConstants.js`. */
export const LOYALTY_POINTS_TOPUP_MIN_RUB = 1;
export const LOYALTY_POINTS_TOPUP_MAX_RUB = 999_999;

export const PAYMENT_STATUS_CREATED = "created";
export const PAYMENT_STATUS_SUCCEEDED = "succeeded";
export const PAYMENT_STATUS_CANCELED = "canceled";

export const PAYMENT_STATUSES = [
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  PAYMENT_STATUS_CANCELED,
];

/**
 * Куда вернуть покупателя после оплаты.
 *
 * Только наш сайт: чужой адрес превратил бы кнопку оплаты в открытый редирект.
 */
const returnUrlSchema = z
  .string({ required_error: "Не указан адрес возврата" })
  .trim()
  .max(1000)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
    message: "Адрес возврата должен быть путём внутри сайта",
  });

/** Body `POST /payments/loyalty-points`. */
export const loyaltyPointsPaymentBodySchema = z.object({
  amountRub: z
    .number({ required_error: "Укажите сумму пополнения" })
    .int("Сумма пополнения — целое число рублей")
    .min(LOYALTY_POINTS_TOPUP_MIN_RUB, `Минимум ${LOYALTY_POINTS_TOPUP_MIN_RUB} ₽`)
    .max(LOYALTY_POINTS_TOPUP_MAX_RUB, `Максимум ${LOYALTY_POINTS_TOPUP_MAX_RUB} ₽`),
  returnUrl: returnUrlSchema,
  idempotencyKey: z.string().trim().min(1).max(64).optional(),
});

export const paymentIdParamsSchema = z.object({
  paymentId: mongoIdSchema,
});

export const orderPaymentParamsSchema = z.object({
  orderId: mongoIdSchema,
});

/** Услуги площадки, оплачиваемые счётом. Синхрон с `yookassaConstants.js`. */
export const PLATFORM_SERVICE_KINDS = [
  "product_promotion",
  "intro_ad",
  "site_header_banner",
  "seller_personal_category",
];

/** Params `POST /payments/service/:serviceKind/:targetId`. */
export const platformServicePaymentParamsSchema = z.object({
  serviceKind: z.enum(PLATFORM_SERVICE_KINDS),
  targetId: mongoIdSchema,
});

/** Body той же ручки: сумму сервер берёт из услуги, из тела — только возврат. */
export const platformServicePaymentBodySchema = z.object({
  returnUrl: returnUrlSchema,
  idempotencyKey: z.string().trim().min(1).max(64).optional(),
});

/** Body `POST /payments/order/:orderId`. */
export const orderPaymentBodySchema = z.object({
  returnUrl: returnUrlSchema,
  idempotencyKey: z.string().trim().min(1).max(64).optional(),
});
