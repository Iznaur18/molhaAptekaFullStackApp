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
  patchSellerProductModerationTrustController,
} from "../controllers/index.js";
import {
  staffCourierListValidation,
  staffCourierModerationValidation,
  staffSafeDealListValidation,
  staffSafeDealModerationValidation,
  staffDisputeListValidation,
  staffResolveDisputeValidation,
  shippingCarrierToggleValidation,
  productModerationTrustValidation,
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

// Публикацию без модерации выдаёт только админ: это отказ от проверки чужого
// контента, а не работа с очередью, поэтому модератору такого права не даём.
router.patch(
  "/sellers/:userId/product-moderation-trust",
  checkAuthMW,
  checkAdminMW,
  productModerationTrustValidation,
  patchSellerProductModerationTrustController,
);

export { router as staffRouter };
