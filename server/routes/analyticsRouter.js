import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  getAnalyticsExportController,
  getAnalyticsOverviewController,
  runAnalyticsReconciliationController,
  trackAdAnalyticsController,
} from "../controllers/index.js";
import {
  analyticsPeriodQueryValidation,
  trackAdAnalyticsValidation,
} from "../validations/index.js";
import { checkAuthMW, checkAdminMW, optionalAuthMW } from "../middlewares/index.js";

const router = createAsyncRouter();

router.post(
  "/track-ad",
  optionalAuthMW,
  trackAdAnalyticsValidation,
  trackAdAnalyticsController,
);

router.get(
  "/overview",
  checkAuthMW,
  checkAdminMW,
  analyticsPeriodQueryValidation,
  getAnalyticsOverviewController,
);

router.get(
  "/export",
  checkAuthMW,
  checkAdminMW,
  analyticsPeriodQueryValidation,
  getAnalyticsExportController,
);

router.post(
  "/reconciliation/run",
  checkAuthMW,
  checkAdminMW,
  runAnalyticsReconciliationController,
);

export { router as analyticsRouter };
