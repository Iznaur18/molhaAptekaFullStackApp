import { Router } from "express";

import {
  cancelMySellerPersonalCategoryCampaignController,
  getMySellerPersonalCategoryCampaignController,
  getSellerPersonalCategoryCatalogTilesController,
  getSellerPersonalCategoryConfigController,
  submitSellerPersonalCategoryCampaignController,
} from "../controllers/SellerPersonalCategory/sellerPersonalCategoryControllers.js";
import {
  approveSellerPersonalCategoryCampaignController,
  getPendingSellerPersonalCategoryCampaignsController,
  getPendingSellerPersonalCategoryCampaignsCountController,
  rejectSellerPersonalCategoryCampaignController,
} from "../controllers/SellerPersonalCategory/sellerPersonalCategoryStaffControllers.js";
import { checkAuthMW, checkProductModeratorMW } from "../middlewares/index.js";
import {
  rejectSellerPersonalCategoryCampaignValidation,
  sellerPersonalCategoryCampaignIdParamValidation,
  submitSellerPersonalCategoryCampaignValidation,
} from "../validations/sellerPersonalCategory/sellerPersonalCategoryValidation.js";

const router = Router();

router.get("/config", getSellerPersonalCategoryConfigController);
router.get("/catalog-tiles", getSellerPersonalCategoryCatalogTilesController);
router.get("/me", checkAuthMW, getMySellerPersonalCategoryCampaignController);
router.post(
  "/",
  checkAuthMW,
  submitSellerPersonalCategoryCampaignValidation,
  submitSellerPersonalCategoryCampaignController,
);
router.delete(
  "/:campaignId",
  checkAuthMW,
  sellerPersonalCategoryCampaignIdParamValidation,
  cancelMySellerPersonalCategoryCampaignController,
);

router.get(
  "/moderation/pending/count",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingSellerPersonalCategoryCampaignsCountController,
);
router.get(
  "/moderation/pending",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingSellerPersonalCategoryCampaignsController,
);
router.post(
  "/moderation/:campaignId/approve",
  checkAuthMW,
  checkProductModeratorMW,
  sellerPersonalCategoryCampaignIdParamValidation,
  approveSellerPersonalCategoryCampaignController,
);
router.post(
  "/moderation/:campaignId/reject",
  checkAuthMW,
  checkProductModeratorMW,
  sellerPersonalCategoryCampaignIdParamValidation,
  rejectSellerPersonalCategoryCampaignValidation,
  rejectSellerPersonalCategoryCampaignController,
);

export { router as sellerPersonalCategoryRouter };
