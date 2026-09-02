import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  makeOrderController,
  postShippingEstimateController,
  getShippingCarriersController,
  getMyOrdersController,
  getMySalesController,
  getMyOrdersActionCountController,
  getMySalesActionCountController,
  getAllOrdersController,
  updateOrderStatusController,
  advanceMyShipmentStatusController,
  raiseDeliveryFeeController,
  markOrderItemShippedBySellerController,
  markOrderItemDeliveredBySellerController,
  markOrderItemReturnedBySellerController,
  markOrderItemCancelledBySellerController,
  confirmOrderItemByBuyerController,
} from "../controllers/index.js";
import {
  checkAuthMW,
  checkAdminMW,
  orderCreateRateLimiter,
  orderItemActionRateLimiter,
} from "../middlewares/index.js";
import {
  makeOrderValidation,
  shippingEstimateValidation,
  updateOrderStatusValidation,
  getAllOrdersValidation,
  getMyOrdersValidation,
  getMySalesValidation,
  orderItemActionValidation,
  orderItemCancelValidation,
  advanceShipmentStatusValidation,
  shipmentDeliveryFeeValidation,
} from "../validations/index.js";

const router = createAsyncRouter();

router.get(
  "/all",
  checkAuthMW,
  checkAdminMW,
  getAllOrdersValidation,
  getAllOrdersController,
);
router.get("/action-count", checkAuthMW, getMyOrdersActionCountController);
router.get("/", checkAuthMW, getMyOrdersValidation, getMyOrdersController);
router.get("/sales/action-count", checkAuthMW, getMySalesActionCountController);
router.get("/sales", checkAuthMW, getMySalesValidation, getMySalesController);
// Список служб задаёт админ, поэтому клиент спрашивает его у нас, а не
// держит копию в константах.
router.get("/shipping-carriers", checkAuthMW, getShippingCarriersController);

// Расчёт доставки внешней службой до оформления: покупатель должен знать
// сумму заранее, а не узнавать её у двери.
router.post(
  "/shipping-estimate",
  checkAuthMW,
  orderCreateRateLimiter,
  shippingEstimateValidation,
  postShippingEstimateController,
);
router.post(
  "/",
  checkAuthMW,
  orderCreateRateLimiter,
  makeOrderValidation,
  makeOrderController,
);
router.patch(
  "/:orderId/status",
  checkAuthMW,
  checkAdminMW,
  updateOrderStatusValidation,
  updateOrderStatusController,
);
router.patch(
  "/:orderId/shipment/:sellerId/delivery-fee",
  checkAuthMW,
  orderItemActionRateLimiter,
  shipmentDeliveryFeeValidation,
  raiseDeliveryFeeController,
);
router.patch(
  "/:orderId/shipment/status",
  checkAuthMW,
  orderItemActionRateLimiter,
  advanceShipmentStatusValidation,
  advanceMyShipmentStatusController,
);
router.patch(
  "/:orderId/items/:itemIndex/shipped",
  checkAuthMW,
  orderItemActionRateLimiter,
  orderItemActionValidation,
  markOrderItemShippedBySellerController,
);
router.patch(
  "/:orderId/items/:itemIndex/cancelled",
  checkAuthMW,
  orderItemActionRateLimiter,
  orderItemCancelValidation,
  markOrderItemCancelledBySellerController,
);
router.patch(
  "/:orderId/items/:itemIndex/delivered",
  checkAuthMW,
  orderItemActionRateLimiter,
  orderItemActionValidation,
  markOrderItemDeliveredBySellerController,
);
router.patch(
  "/:orderId/items/:itemIndex/returned",
  checkAuthMW,
  orderItemActionRateLimiter,
  orderItemActionValidation,
  markOrderItemReturnedBySellerController,
);
router.patch(
  "/:orderId/items/:itemIndex/confirm",
  checkAuthMW,
  orderItemActionRateLimiter,
  orderItemActionValidation,
  confirmOrderItemByBuyerController,
);

export { router as orderRouter };
