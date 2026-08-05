import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { checkAuthMW } from "../middlewares/index.js";
import {
  deleteOneCSettingsController,
  getOneCLogsController,
  getOneCSettingsController,
  postOneCSyncController,
  postOneCTestController,
  putOneCSettingsController,
} from "../controllers/OneC/onecControllers.js";
import {
  getOneCLogsValidation,
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

export default router;
