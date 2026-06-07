import {
  createInstallmentContractBodySchema,
  installmentCancelBodySchema,
  installmentContractIdParamsSchema,
  installmentDisputeBodySchema,
  installmentDisputeIdParamsSchema,
  installmentPaymentIndexParamsSchema,
  installmentSellerMessageBodySchema,
  rejectInstallmentModerationBodySchema,
  resolveInstallmentDisputeBodySchema,
  upsertProductInstallmentProgramBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateRuDeliveryAddress } from "../../middlewares/validateRuDeliveryAddress.js";

export const upsertProductInstallmentProgramValidation = [
  validateBodyZod(upsertProductInstallmentProgramBodySchema),
];

export const rejectInstallmentModerationValidation = [
  validateBodyZod(rejectInstallmentModerationBodySchema),
];

export const createInstallmentContractValidation = [
  validateBodyZod(createInstallmentContractBodySchema),
  validateRuDeliveryAddress({
    lineField: "deliveryAddress",
    flatField: "deliveryAddressFlat",
    lineRequired: true,
  }),
];

export const installmentContractIdParamValidation = [
  validateParamsZod(installmentContractIdParamsSchema),
];

export const installmentPaymentIndexParamValidation = [
  validateParamsZod(installmentPaymentIndexParamsSchema),
];

export const installmentSellerMessageValidation = [
  validateBodyZod(installmentSellerMessageBodySchema),
];

export const installmentDisputeValidation = [validateBodyZod(installmentDisputeBodySchema)];

export const resolveInstallmentDisputeValidation = [
  validateBodyZod(resolveInstallmentDisputeBodySchema),
];

export const installmentDisputeIdParamValidation = [
  validateParamsZod(installmentDisputeIdParamsSchema),
];

export const installmentCancelValidation = [validateBodyZod(installmentCancelBodySchema)];
