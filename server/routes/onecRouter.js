import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { checkAuthMW } from "../middlewares/index.js";
import {
  deleteOneCSettingsController,
  getOneCCategoryMappingsController,
  getOneCImportJobsController,
  getOneCLogsController,
  getOneCSettingsController,
  postOneCExchangeCredentialsController,
  postOneCSyncController,
  postOneCTestController,
  putOneCCategoryMappingsController,
  putOneCSettingsController,
} from "../controllers/OneC/onecControllers.js";
import {
  getOneCImportJobsValidation,
  getOneCLogsValidation,
  putOneCCategoryMappingsValidation,
  putOneCSettingsValidation,
} from "../validations/onec/onecValidation.js";

const router = createAsyncRouter();

router.get("/settings", checkAuthMW, getOneCSettingsController);
router.put(
  "/settings",
  checkAuthMW,
  putOneCSettingsValidation,
  putOneCSettingsController,
);
router.delete("/settings", checkAuthMW, deleteOneCSettingsController);
router.post("/test", checkAuthMW, postOneCTestController);
router.post("/sync", checkAuthMW, postOneCSyncController);
router.get("/logs", checkAuthMW, getOneCLogsValidation, getOneCLogsController);

// --- CommerceML: 1С сама шлёт данные на /onec/exchange (см. onecExchangeRouter) ---

router.post(
  "/exchange-credentials",
  checkAuthMW,
  postOneCExchangeCredentialsController,
);
router.get("/category-mappings", checkAuthMW, getOneCCategoryMappingsController);
router.put(
  "/category-mappings",
  checkAuthMW,
  putOneCCategoryMappingsValidation,
  putOneCCategoryMappingsController,
);
router.get(
  "/import-jobs",
  checkAuthMW,
  getOneCImportJobsValidation,
  getOneCImportJobsController,
);

export default router;
