import { z } from "zod";

/** Синхрон с лимитами покупки баллов (1 ₽ = 1 балл). */
export const LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN = 1;
export const LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX = 999_999;

export const MONEY_IDEMPOTENCY_KEY_MAX_LENGTH = 64;

export const adminCreditLoyaltyPointsBodySchema = z
  .object({
    amount: z.coerce
      .number()
      .int()
      .min(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN)
      .max(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX),
    idempotencyKey: z
      .string({ required_error: "Укажите idempotencyKey" })
      .trim()
      .min(1, "Укажите idempotencyKey")
      .max(MONEY_IDEMPOTENCY_KEY_MAX_LENGTH),
  })
  .strict();
