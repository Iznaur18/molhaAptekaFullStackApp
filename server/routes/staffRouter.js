import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  getStaffBroadcastRecipientsCountController,
  postStaffBroadcastNotificationController,
  getStaffCourierApplicationsController,
  patchStaffCourierModerationController,
  getStaffSafeDealApplicationsController,
  patchStaffSafeDealModerationController,
  getStaffDisputesController,
  postStaffResolveDisputeController,
  getStaffShippingCarriersController,
  patchStaffShippingCarrierController,
} from "../controllers/index.js";
import {
  staffCourierListValidation,
  staffCourierModerationValidation,
  staffSafeDealListValidation,
  staffSafeDealModerationValidation,
  staffDisputeListValidation,
  staffResolveDisputeValidation,
  shippingCarrierToggleValidation,
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

// Заявки на безопасную сделку модерируют те же, кто и курьеров: проверка
// сводится к сверке ИНН с ЕГРЮЛ/ЕГРИП, отдельной роли под это не нужно.
router.get(
  "/safe-deal",
  checkAuthMW,
  checkProductModeratorMW,
  staffSafeDealListValidation,
  getStaffSafeDealApplicationsController,
);
router.patch(
  "/safe-deal/:userId/moderation",
  checkAuthMW,
  checkProductModeratorMW,
  staffSafeDealModerationValidation,
  patchStaffSafeDealModerationController,
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

// Службы доставки включает и выключает только админ: это решение о том,
// что вообще предлагать продавцам и покупателям.
router.get(
  "/shipping-carriers",
  checkAuthMW,
  checkAdminMW,
  getStaffShippingCarriersController,
);
router.patch(
  "/shipping-carriers/:carrierId",
  checkAuthMW,
  checkAdminMW,
  shippingCarrierToggleValidation,
  patchStaffShippingCarrierController,
);

export { router as staffRouter };
