import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { ORDER_LINE_ITEM_QUANTITY_MIN, ORDER_PAYMENT_METHODS } from "./order.js";
import { ADDRESS_LINE_MAX_LENGTH } from "./userFields.js";

/** Синхрон с `server/constants/installmentConstants.js`. */
export const INSTALLMENT_PLANS_MAX = 5;
export const INSTALLMENT_MONTHS_MIN = 2;
export const INSTALLMENT_MONTHS_MAX = 24;
export const INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB = 100;
export const INSTALLMENT_PLAN_TITLE_MAX_LENGTH = 80;
export const INSTALLMENT_TEXT_MAX_LENGTH = 2000;

export const INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS = "in_progress";
export const INSTALLMENT_CONTRACT_STATUS_COMPLETED = "completed";
export const INSTALLMENT_CONTRACT_STATUS_DEFAULTED = "defaulted";
export const INSTALLMENT_CONTRACT_STATUS_CANCELLED = "cancelled";

export const INSTALLMENT_SALES_LIST_FILTERS = [
  INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_DEFAULTED,
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
];

export const INSTALLMENT_DISPUTE_ACTIONS = [
  "close",
  "cancel",
  "adjust_schedule",
  "partial_refund",
];

const installmentPlanSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(INSTALLMENT_PLAN_TITLE_MAX_LENGTH),
  monthsCount: z.coerce
    .number()
    .int()
    .min(INSTALLMENT_MONTHS_MIN)
    .max(INSTALLMENT_MONTHS_MAX),
  monthlyAmountRub: z.coerce
    .number()
    .int()
    .min(INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB),
  firstPaymentRequiredNow: z.boolean().optional(),
});

export const upsertProductInstallmentProgramBodySchema = z.object({
  isEnabled: z.boolean({ required_error: "isEnabled должен быть boolean" }),
  plans: z
    .array(installmentPlanSchema)
    .min(1, `plans: от 1 до ${INSTALLMENT_PLANS_MAX} элементов`)
    .max(INSTALLMENT_PLANS_MAX, `plans: от 1 до ${INSTALLMENT_PLANS_MAX} элементов`),
});

/** Тело `POST .../installment-contracts` (структура; DaData — отдельно на сервере). */
export const createInstallmentContractBodySchema = z.object({
  planId: mongoIdSchema,
  quantity: z.coerce
    .number()
    .int()
    .min(ORDER_LINE_ITEM_QUANTITY_MIN, `quantity >= ${ORDER_LINE_ITEM_QUANTITY_MIN}`),
  deliveryAddress: z
    .string()
    .trim()
    .min(1, "Адрес доставки обязателен")
    .max(ADDRESS_LINE_MAX_LENGTH),
  deliveryAddressFlat: z
    .string()
    .trim()
    .max(20)
    .optional()
    .default(""),
  paymentMethod: z.enum(ORDER_PAYMENT_METHODS),
});

export const installmentContractIdParamsSchema = z.object({
  contractId: mongoIdSchema,
});

export const installmentPaymentIndexParamsSchema = z.object({
  contractId: mongoIdSchema,
  paymentIndex: z.coerce.number().int().min(1),
});

export const installmentDisputeIdParamsSchema = z.object({
  disputeId: mongoIdSchema,
});

export const installmentSellerMessageBodySchema = z.object({
  message: z.string().trim().min(1).max(INSTALLMENT_TEXT_MAX_LENGTH),
});

export const installmentDisputeBodySchema = z.object({
  reason: z.string().trim().min(1).max(INSTALLMENT_TEXT_MAX_LENGTH),
});

export const resolveInstallmentDisputeBodySchema = z.object({
  resolutionNote: z.string().trim().max(INSTALLMENT_TEXT_MAX_LENGTH).optional(),
  action: z.enum(INSTALLMENT_DISPUTE_ACTIONS),
  partialRefundRub: z.coerce.number().int().min(1).optional(),
});

export const installmentCancelBodySchema = z.object({
  reason: z.string().trim().max(INSTALLMENT_TEXT_MAX_LENGTH).optional(),
});

export const getMyInstallmentContractsListQuerySchema = z.object({
  status: z.enum(INSTALLMENT_SALES_LIST_FILTERS).optional(),
});
