import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  getAnalyticsExportController,
  getAnalyticsOverviewController,
  runAnalyticsReconciliationController,
  trackAdAnalyticsController,
  trackClientAnalyticsController,
} from "../controllers/index.js";
import {
  analyticsPeriodQueryValidation,
  trackAdAnalyticsValidation,
  trackClientAnalyticsValidation,
} from "../validations/index.js";
import { emptyBodyValidation } from "../validations/common/emptyBodyValidation.js";
import { checkAuthMW, checkAdminMW, optionalAuthMW } from "../middlewares/index.js";

const router = createAsyncRouter();

router.post(
  "/track-ad",
  optionalAuthMW,
  trackAdAnalyticsValidation,
  trackAdAnalyticsController,
);

router.post(
  "/track",
  checkAuthMW,
  trackClientAnalyticsValidation,
  trackClientAnalyticsController,
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

// Контроллер тело не читает: валидация отклоняет лишние поля, чтобы маршрут
// не выпадал из аудита `scripts/auditRouteBodyValidation.js`.
router.post(
  "/reconciliation/run",
  checkAuthMW,
  checkAdminMW,
  emptyBodyValidation,
  runAnalyticsReconciliationController,
);

export { router as analyticsRouter };
