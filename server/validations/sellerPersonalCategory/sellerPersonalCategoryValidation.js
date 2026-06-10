import {
  rejectSellerPersonalCategoryCampaignBodySchema,
  sellerPersonalCategoryCampaignIdParamsSchema,
  submitSellerPersonalCategoryCampaignBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const submitSellerPersonalCategoryCampaignValidation = [
  validateBodyZod(submitSellerPersonalCategoryCampaignBodySchema),
];

export const rejectSellerPersonalCategoryCampaignValidation = [
  validateBodyZod(rejectSellerPersonalCategoryCampaignBodySchema),
];

export const sellerPersonalCategoryCampaignIdParamValidation = [
  validateParamsZod(sellerPersonalCategoryCampaignIdParamsSchema),
];
