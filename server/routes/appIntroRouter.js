import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  getAppIntroSettingsController,
  patchAppIntroSettingsController,
} from "../controllers/AppIntro/appIntroSettingsControllers.js";
import { checkAdminMW, checkAuthMW } from "../middlewares/index.js";
import { patchAppIntroSettingsValidation } from "../validations/appIntro/appIntroSettingsValidation.js";

const router = createAsyncRouter();

router.get("/", getAppIntroSettingsController);
router.patch(
  "/",
  checkAuthMW,
  checkAdminMW,
  patchAppIntroSettingsValidation,
  patchAppIntroSettingsController,
);

export { router as appIntroRouter };
