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
