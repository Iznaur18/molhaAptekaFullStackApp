import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  getAnalyticsExportController,
  getAnalyticsOverviewController,
  runAnalyticsReconciliationController,
} from "../controllers/index.js";
import { analyticsPeriodQueryValidation } from "../validations/index.js";
import { checkAuthMW, checkAdminMW } from "../middlewares/index.js";

const router = createAsyncRouter();

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
