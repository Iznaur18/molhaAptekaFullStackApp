import {
  acceptShipmentController,
  completeDeliveryController,
  confirmHandoverController,
  getMyCourierProfileController,
  issueHandoverCodeController,
  markArrivedController,
  startDeliveryController,
  submitCourierApplicationController,
  getCourierOverviewController,
} from "../controllers/index.js";
import { checkAuthMW, orderItemActionRateLimiter } from "../middlewares/index.js";
import {
  courierApplicationValidation,
  courierHandoverCodeValidation,
  courierShipmentValidation,
  courierOverviewValidation,
} from "../validations/index.js";
import { createAsyncRouter } from "../utils/createAsyncRouter.js";

const router = createAsyncRouter();

// путь в createApp: /couriers
// Множественное число намеренно: SPA-роуты /become-courier и
// /courier-moderation не должны попадать в API по префиксу.
router.get("/me", checkAuthMW, getMyCourierProfileController);
router.post(
  "/application",
  checkAuthMW,
  courierApplicationValidation,
  submitCourierApplicationController,
);

// Свободные отправления в регионе курьера.
router.get(
  "/overview",
  checkAuthMW,
  courierOverviewValidation,
  getCourierOverviewController,
);

// Отправление адресуется парой «заказ + продавец» — это и есть его ключ.
const shipmentBase = "/shipments/:orderId/:sellerId";

router.post(
  `${shipmentBase}/accept`,
  checkAuthMW,
  orderItemActionRateLimiter,
  courierShipmentValidation,
  acceptShipmentController,
);
router.post(
  `${shipmentBase}/handover-code`,
  checkAuthMW,
  orderItemActionRateLimiter,
  courierShipmentValidation,
  issueHandoverCodeController,
);
router.post(
  `${shipmentBase}/handover`,
  checkAuthMW,
  orderItemActionRateLimiter,
  courierHandoverCodeValidation,
  confirmHandoverController,
);
router.post(
  `${shipmentBase}/start-delivery`,
  checkAuthMW,
  orderItemActionRateLimiter,
  courierShipmentValidation,
  startDeliveryController,
);
router.post(
  `${shipmentBase}/arrived`,
  checkAuthMW,
  orderItemActionRateLimiter,
  courierShipmentValidation,
  markArrivedController,
);
router.post(
  `${shipmentBase}/complete`,
  checkAuthMW,
  orderItemActionRateLimiter,
  courierHandoverCodeValidation,
  completeDeliveryController,
);

export { router as courierRouter };
