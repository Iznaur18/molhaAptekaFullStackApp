import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  cancelMyIntroAdCampaignController,
  getIntroAdConfigController,
  getMyIntroAdCampaignController,
  submitIntroAdCampaignController,
} from "../controllers/IntroAd/introAdCampaignControllers.js";
import {
  approveIntroAdCampaignController,
  cancelIntroAdCampaignByStaffController,
  getManagedIntroAdCampaignsController,
  getPendingIntroAdCampaignsController,
  getPendingIntroAdCampaignsCountController,
  rejectIntroAdCampaignController,
} from "../controllers/IntroAd/introAdCampaignStaffControllers.js";
import { checkAuthMW, checkProductModeratorMW } from "../middlewares/index.js";
import {
  introAdCampaignIdParamValidation,
  rejectIntroAdCampaignValidation,
  submitIntroAdCampaignValidation,
} from "../validations/introAd/introAdCampaignValidation.js";

const router = createAsyncRouter();

router.get("/config", getIntroAdConfigController);
router.get("/me", checkAuthMW, getMyIntroAdCampaignController);
router.post("/", checkAuthMW, submitIntroAdCampaignValidation, submitIntroAdCampaignController);
router.delete(
  "/:campaignId",
  checkAuthMW,
  introAdCampaignIdParamValidation,
  cancelMyIntroAdCampaignController,
);

router.get(
  "/moderation/pending/count",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingIntroAdCampaignsCountController,
);
router.get(
  "/moderation/pending",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingIntroAdCampaignsController,
);
router.get(
  "/moderation/managed",
  checkAuthMW,
  checkProductModeratorMW,
  getManagedIntroAdCampaignsController,
);
router.post(
  "/moderation/:campaignId/approve",
  checkAuthMW,
  checkProductModeratorMW,
  introAdCampaignIdParamValidation,
  approveIntroAdCampaignController,
);
router.post(
  "/moderation/:campaignId/reject",
  checkAuthMW,
  checkProductModeratorMW,
  introAdCampaignIdParamValidation,
  rejectIntroAdCampaignValidation,
  rejectIntroAdCampaignController,
);
router.delete(
  "/moderation/:campaignId",
  checkAuthMW,
  checkProductModeratorMW,
  introAdCampaignIdParamValidation,
  cancelIntroAdCampaignByStaffController,
);

export { router as introAdRouter };
