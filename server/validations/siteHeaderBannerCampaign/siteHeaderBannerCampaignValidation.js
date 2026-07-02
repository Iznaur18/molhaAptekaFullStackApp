import {
  rejectSiteHeaderBannerCampaignBodySchema,
  siteHeaderBannerCampaignIdParamsSchema,
  submitSiteHeaderBannerCampaignBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const submitSiteHeaderBannerCampaignValidation = [
  validateBodyZod(submitSiteHeaderBannerCampaignBodySchema),
];

export const rejectSiteHeaderBannerCampaignValidation = [
  validateBodyZod(rejectSiteHeaderBannerCampaignBodySchema),
];

export const siteHeaderBannerCampaignIdParamValidation = [
  validateParamsZod(siteHeaderBannerCampaignIdParamsSchema),
];
