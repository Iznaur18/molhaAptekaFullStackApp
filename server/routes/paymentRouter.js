import {
  createLoyaltyPointsPaymentController,
  createOrderPaymentController,
  getMyPaymentController,
  getPaymentConfigController,
  postYookassaWebhookController,
} from "../controllers/index.js";
import { checkAuthMW } from "../middlewares/index.js";
import {
  loyaltyPointsPaymentValidation,
  orderPaymentValidation,
  paymentIdParamsValidation,
} from "../validations/index.js";
import { createAsyncRouter } from "../utils/createAsyncRouter.js";

const router = createAsyncRouter();

// путь в createApp: /payments
router.get("/config", getPaymentConfigController);

// Уведомление от ЮKassa — без авторизации: у банка нет наших кук.
// Тело не является доказательством: статус перезапрашивается в API.
router.post("/yookassa/webhook", postYookassaWebhookController);

router.post(
  "/loyalty-points",
  checkAuthMW,
  loyaltyPointsPaymentValidation,
  createLoyaltyPointsPaymentController,
);

router.post(
  "/order/:orderId",
  checkAuthMW,
  orderPaymentValidation,
  createOrderPaymentController,
);

// Ниже маршрутов с фиксированным префиксом: иначе `/config` уедет сюда.
router.get("/:paymentId", checkAuthMW, paymentIdParamsValidation, getMyPaymentController);

export { router as paymentRouter };
