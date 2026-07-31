import { z } from "zod";

/** Синхрон с `server/constants/affiliateConstants.js`. */
export const AFFILIATE_PERCENT_MIN = 1;
export const AFFILIATE_PERCENT_MAX = 50;
export const AFFILIATE_QUERY_PARAM = "aff";
export const AFFILIATE_CLICK_TTL_DAYS = 14;
export const AFFILIATE_BUDGET_TOP_UP_AMOUNT_MAX = 1_000_000_000;
export const AFFILIATE_IDEMPOTENCY_KEY_MAX_LENGTH = 64;

export const AFFILIATE_LINE_STATUSES = [
  "none",
  "pending",
  "paid",
  "skipped_no_program",
  "skipped_antifraud",
];

export const affiliatePercentSchema = z.coerce
  .number({ invalid_type_error: "Укажите процент" })
  .int("Процент должен быть целым числом")
  .min(AFFILIATE_PERCENT_MIN, `Минимум ${AFFILIATE_PERCENT_MIN}%`)
  .max(AFFILIATE_PERCENT_MAX, `Максимум ${AFFILIATE_PERCENT_MAX}%`);

/** Поля patch товара (только edit / управление). */
export const productAffiliatePatchFieldsShape = {
  affiliateEnabled: z.coerce.boolean().optional(),
  affiliatePercent: z.coerce
    .number()
    .int()
    .min(0)
    .max(AFFILIATE_PERCENT_MAX)
    .optional(),
};

/**
 * @param {{ affiliateEnabled?: boolean; affiliatePercent?: number }} body
 * @param {import("zod").RefinementCtx} ctx
 */
export function assertAffiliatePatchPair(body, ctx) {
  const hasEnabled = Object.prototype.hasOwnProperty.call(body, "affiliateEnabled");
  const hasPercent = Object.prototype.hasOwnProperty.call(body, "affiliatePercent");
  if (!hasEnabled && !hasPercent) {
    return;
  }

  const enabled = hasEnabled ? body.affiliateEnabled === true : undefined;
  const percent = hasPercent ? Math.floor(Number(body.affiliatePercent)) : undefined;

  if (
    enabled === true &&
    hasPercent &&
    (!Number.isFinite(percent) || percent < AFFILIATE_PERCENT_MIN)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["affiliatePercent"],
      message: `При включённой партнёрке укажите процент от ${AFFILIATE_PERCENT_MIN} до ${AFFILIATE_PERCENT_MAX}`,
    });
  }

  if (
    percent != null &&
    Number.isFinite(percent) &&
    percent > 0 &&
    percent < AFFILIATE_PERCENT_MIN
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["affiliatePercent"],
      message: `Процент от ${AFFILIATE_PERCENT_MIN} до ${AFFILIATE_PERCENT_MAX}`,
    });
  }
}

export const topUpAffiliateBudgetBodySchema = z
  .object({
    amount: z.coerce
      .number({ invalid_type_error: "Укажите сумму" })
      .int("Сумма должна быть целым числом")
      .positive("Сумма должна быть больше 0")
      .max(AFFILIATE_BUDGET_TOP_UP_AMOUNT_MAX, "Слишком большая сумма"),
    idempotencyKey: z
      .string({ required_error: "Укажите idempotencyKey" })
      .trim()
      .min(1, "Укажите idempotencyKey")
      .max(AFFILIATE_IDEMPOTENCY_KEY_MAX_LENGTH),
  })
  .strict();

export const affiliateBudgetStatusDataSchema = z.object({
  affiliateBudget: z.number(),
  loyaltyPointsBalance: z.number(),
});

export const affiliateEarningsRowSchema = z.object({
  orderId: z.string(),
  itemIndex: z.number(),
  productName: z.string(),
  amount: z.number(),
  percentUsed: z.number().nullable(),
  status: z.string(),
  createdAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  sourceId: z.string().optional(),
});

export const myAffiliateEarningsDataSchema = z.object({
  loyaltyPointsBalance: z.number(),
  rows: z.array(affiliateEarningsRowSchema),
});
