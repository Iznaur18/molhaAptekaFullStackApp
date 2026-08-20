import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  getStaffBroadcastRecipientsCountController,
  postStaffBroadcastNotificationController,
} from "../controllers/index.js";
import { staffBroadcastNotificationValidation } from "../validations/user/staffBroadcastNotificationValidation.js";
import { checkAuthMW, checkAdminMW } from "../middlewares/index.js";

const router = createAsyncRouter();

// путь в createApp: /staff
router.get(
  "/broadcast-notifications/recipients-count",
  checkAuthMW,
  checkAdminMW,
  getStaffBroadcastRecipientsCountController,
);
router.post(
  "/broadcast-notifications",
  checkAuthMW,
  checkAdminMW,
  staffBroadcastNotificationValidation,
  postStaffBroadcastNotificationController,
);

export { router as staffRouter };
