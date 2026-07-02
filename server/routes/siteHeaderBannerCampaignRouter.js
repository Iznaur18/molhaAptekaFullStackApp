import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  cancelMySiteHeaderBannerCampaignController,
  getMySiteHeaderBannerCampaignController,
  getSiteHeaderBannerCampaignConfigController,
  submitSiteHeaderBannerCampaignController,
} from "../controllers/SiteHeaderBannerCampaign/siteHeaderBannerCampaignControllers.js";
import {
  approveSiteHeaderBannerCampaignController,
  cancelSiteHeaderBannerCampaignByStaffController,
  getManagedSiteHeaderBannerCampaignsController,
  getPendingSiteHeaderBannerCampaignsController,
  getPendingSiteHeaderBannerCampaignsCountController,
  rejectSiteHeaderBannerCampaignController,
} from "../controllers/SiteHeaderBannerCampaign/siteHeaderBannerCampaignStaffControllers.js";
import { checkAuthMW, checkProductModeratorMW } from "../middlewares/index.js";
import {
  rejectSiteHeaderBannerCampaignValidation,
  siteHeaderBannerCampaignIdParamValidation,
  submitSiteHeaderBannerCampaignValidation,
} from "../validations/siteHeaderBannerCampaign/siteHeaderBannerCampaignValidation.js";

const router = createAsyncRouter();

router.get("/config", getSiteHeaderBannerCampaignConfigController);
router.get("/me", checkAuthMW, getMySiteHeaderBannerCampaignController);
router.post(
  "/",
  checkAuthMW,
  submitSiteHeaderBannerCampaignValidation,
  submitSiteHeaderBannerCampaignController,
);
router.delete(
  "/:campaignId",
  checkAuthMW,
  siteHeaderBannerCampaignIdParamValidation,
  cancelMySiteHeaderBannerCampaignController,
);

router.get(
  "/moderation/pending/count",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingSiteHeaderBannerCampaignsCountController,
);
router.get(
  "/moderation/pending",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingSiteHeaderBannerCampaignsController,
);
router.get(
  "/moderation/managed",
  checkAuthMW,
  checkProductModeratorMW,
  getManagedSiteHeaderBannerCampaignsController,
);
router.post(
  "/moderation/:campaignId/approve",
  checkAuthMW,
  checkProductModeratorMW,
  siteHeaderBannerCampaignIdParamValidation,
  approveSiteHeaderBannerCampaignController,
);
router.post(
  "/moderation/:campaignId/reject",
  checkAuthMW,
  checkProductModeratorMW,
  siteHeaderBannerCampaignIdParamValidation,
  rejectSiteHeaderBannerCampaignValidation,
  rejectSiteHeaderBannerCampaignController,
);
router.delete(
  "/moderation/:campaignId",
  checkAuthMW,
  checkProductModeratorMW,
  siteHeaderBannerCampaignIdParamValidation,
  cancelSiteHeaderBannerCampaignByStaffController,
);

export { router as siteHeaderBannerCampaignRouter };
