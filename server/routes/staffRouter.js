import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  getStaffBroadcastRecipientsCountController,
  postStaffBroadcastNotificationController,
  getStaffCourierApplicationsController,
  patchStaffCourierModerationController,
  getStaffDisputesController,
  postStaffResolveDisputeController,
} from "../controllers/index.js";
import {
  staffCourierListValidation,
  staffCourierModerationValidation,
  staffDisputeListValidation,
  staffResolveDisputeValidation,
} from "../validations/index.js";
import { checkProductModeratorMW } from "../middlewares/checkProductModeratorMW.js";
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

// Модерация курьеров доступна админам И модераторам — как модерация товаров.
router.get(
  "/couriers",
  checkAuthMW,
  checkProductModeratorMW,
  staffCourierListValidation,
  getStaffCourierApplicationsController,
);
router.patch(
  "/couriers/:userId/moderation",
  checkAuthMW,
  checkProductModeratorMW,
  staffCourierModerationValidation,
  patchStaffCourierModerationController,
);

// Споры по отправлениям разбирают те же, кто модерирует курьеров.
router.get(
  "/shipment-disputes",
  checkAuthMW,
  checkProductModeratorMW,
  staffDisputeListValidation,
  getStaffDisputesController,
);
router.post(
  "/shipment-disputes/:orderId/:sellerId/resolve",
  checkAuthMW,
  checkProductModeratorMW,
  staffResolveDisputeValidation,
  postStaffResolveDisputeController,
);

export { router as staffRouter };
