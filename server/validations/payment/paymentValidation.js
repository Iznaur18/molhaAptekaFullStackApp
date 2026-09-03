import {
  loyaltyPointsPaymentBodySchema,
  orderPaymentBodySchema,
  orderPaymentParamsSchema,
  paymentIdParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const loyaltyPointsPaymentValidation = [
  validateBodyZod(loyaltyPointsPaymentBodySchema),
];

export const paymentIdParamsValidation = [validateParamsZod(paymentIdParamsSchema)];

export const orderPaymentValidation = [
  validateParamsZod(orderPaymentParamsSchema),
  validateBodyZod(orderPaymentBodySchema),
];
