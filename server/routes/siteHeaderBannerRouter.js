import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  getSiteHeaderBannerSettingsController,
  getSiteHeaderBannerSlidesController,
  patchSiteHeaderBannerSettingsController,
} from "../controllers/SiteHeaderBanner/siteHeaderBannerControllers.js";
import { checkAuthMW, checkProductModeratorMW } from "../middlewares/index.js";
import { patchSiteHeaderBannerSettingsValidation } from "../validations/siteHeaderBanner/siteHeaderBannerValidation.js";

const router = createAsyncRouter();

router.get("/", getSiteHeaderBannerSlidesController);
router.get(
  "/settings",
  checkAuthMW,
  checkProductModeratorMW,
  getSiteHeaderBannerSettingsController,
);
router.patch(
  "/settings",
  checkAuthMW,
  checkProductModeratorMW,
  patchSiteHeaderBannerSettingsValidation,
  patchSiteHeaderBannerSettingsController,
);

export { router as siteHeaderBannerRouter };
