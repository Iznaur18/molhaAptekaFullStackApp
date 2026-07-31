import { z } from "zod";

export const MONEY_IDEMPOTENCY_KEY_MAX_LENGTH = 64;

export const purchasePremiumBodySchema = z
  .object({
    idempotencyKey: z
      .string({ required_error: "Укажите idempotencyKey" })
      .trim()
      .min(1, "Укажите idempotencyKey")
      .max(MONEY_IDEMPOTENCY_KEY_MAX_LENGTH),
  })
  .strict();
