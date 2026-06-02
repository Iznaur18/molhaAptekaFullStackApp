import { Router } from 'express';

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
} from '../controllers/index.js';
import { checkAuthMW, checkAdminMW } from '../middlewares/index.js';
import {
    makeOrderValidation,
    updateOrderStatusValidation,
    getAllOrdersValidation,
    getMySalesValidation,
    orderItemActionValidation,
} from '../validations/index.js';

const router = Router();

router.get('/all', checkAuthMW, checkAdminMW, getAllOrdersValidation, getAllOrdersController);
router.get('/action-count', checkAuthMW, getMyOrdersActionCountController);
router.get('/', checkAuthMW, getMyOrdersController);
router.get('/sales/action-count', checkAuthMW, getMySalesActionCountController);
router.get('/sales', checkAuthMW, getMySalesValidation, getMySalesController);
router.post('/', checkAuthMW, makeOrderValidation, makeOrderController);
router.patch(
    '/:orderId/status',
    checkAuthMW,
    checkAdminMW,
    updateOrderStatusValidation,
    updateOrderStatusController,
);
router.patch(
    '/:orderId/items/:itemIndex/shipped',
    checkAuthMW,
    orderItemActionValidation,
    markOrderItemShippedBySellerController,
);
router.patch(
    '/:orderId/items/:itemIndex/cancelled',
    checkAuthMW,
    orderItemActionValidation,
    markOrderItemCancelledBySellerController,
);
router.patch(
    '/:orderId/items/:itemIndex/delivered',
    checkAuthMW,
    orderItemActionValidation,
    markOrderItemDeliveredBySellerController,
);
router.patch(
    '/:orderId/items/:itemIndex/confirm',
    checkAuthMW,
    orderItemActionValidation,
    confirmOrderItemByBuyerController,
);

export { router as orderRouter };
