import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  makeOrderController,
  getMyOrdersController,
  getMySalesController,
  getMyOrdersActionCountController,
  getMySalesActionCountController,
  getAllOrdersController,
  updateOrderStatusController,
  markOrderItemShippedBySellerController,
  markOrderItemDeliveredBySellerController,
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
  updateOrderStatusValidation,
  getAllOrdersValidation,
  getMyOrdersValidation,
  getMySalesValidation,
  orderItemActionValidation,
  orderItemCancelValidation,
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
  "/:orderId/items/:itemIndex/confirm",
  checkAuthMW,
  orderItemActionRateLimiter,
  orderItemActionValidation,
  confirmOrderItemByBuyerController,
);

export { router as orderRouter };
