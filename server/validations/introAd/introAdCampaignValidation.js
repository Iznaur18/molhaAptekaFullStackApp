import {
  introAdCampaignIdParamsSchema,
  rejectIntroAdCampaignBodySchema,
  submitIntroAdCampaignBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const submitIntroAdCampaignValidation = [
  validateBodyZod(submitIntroAdCampaignBodySchema),
];

export const rejectIntroAdCampaignValidation = [
  validateBodyZod(rejectIntroAdCampaignBodySchema),
];

export const introAdCampaignIdParamValidation = [
  validateParamsZod(introAdCampaignIdParamsSchema),
];
