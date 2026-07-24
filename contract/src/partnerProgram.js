import { z } from "zod";

export const CONVERT_PARTNER_BALANCE_AMOUNT_MAX = 1_000_000_000;
export const CONVERT_PARTNER_IDEMPOTENCY_KEY_MAX_LENGTH = 64;

export const convertPartnerBalanceBodySchema = z
  .object({
    amount: z.coerce
      .number({ invalid_type_error: "Укажите сумму" })
      .int("Сумма должна быть целым числом")
      .positive("Сумма должна быть больше 0")
      .max(CONVERT_PARTNER_BALANCE_AMOUNT_MAX, "Слишком большая сумма"),
    idempotencyKey: z
      .string()
      .trim()
      .min(1)
      .max(CONVERT_PARTNER_IDEMPOTENCY_KEY_MAX_LENGTH)
      .optional(),
  })
  .strict();
