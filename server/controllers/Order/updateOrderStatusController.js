import { OrderModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import {
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
} from '../../constants/orderConstants.js';
import { syncRaffleProgressForProductSale } from '../../utils/raffleHelpers.js';
import {
    decrementProductStockOnItemConfirmed,
    restoreProductStockOnItemCancelled,
} from '../../utils/productStock.js';
import { normalizeOrderDocumentForRuntime, normalizeOrderItemsForRuntime } from './orderStatus.js';

/** `PATCH /order/:orderId/status` — смена статуса заказа (только админ). */
export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return errorRes(res, 404, 'Заказ не найден');
        }
        normalizeOrderDocumentForRuntime(order);
        normalizeOrderItemsForRuntime(order.items);

        const now = new Date();
        /** @type {{ productId: import('mongoose').Types.ObjectId; quantity: number }[]} */
        const itemsPendingConfirmStock = [];

        for (const item of order.items) {
            const previousStatus = item.status;
            const productId = item.productId;
            if (productId == null) {
                continue;
            }
            if (
                status === ORDER_STATUS_CANCELLED &&
                previousStatus !== ORDER_STATUS_CANCELLED
            ) {
                try {
                    await restoreProductStockOnItemCancelled(
                        productId,
                        item.quantity,
                        previousStatus,
                    );
                } catch (stockError) {
                    console.error('restoreProductStockOnItemCancelled error:', stockError);
                }
                if (previousStatus === ORDER_STATUS_CONFIRMED) {
                    try {
                        await syncRaffleProgressForProductSale(productId);
                    } catch (raffleSyncError) {
                        console.error(
                            'syncRaffleProgressForProductSale error:',
                            raffleSyncError,
                        );
                    }
                }
            } else if (
                status === ORDER_STATUS_CONFIRMED &&
                previousStatus !== ORDER_STATUS_CONFIRMED
            ) {
                itemsPendingConfirmStock.push({
                    productId,
                    quantity: item.quantity,
                });
            }
        }

        order.items.forEach((item) => {
            item.status = status;
            if (status !== ORDER_STATUS_DELIVERED) {
                item.deliveredAt = null;
                item.deliveredBy = null;
            } else {
                item.deliveredAt = item.deliveredAt ?? now;
            }
            if (status !== ORDER_STATUS_CONFIRMED) {
                item.confirmedAt = null;
                item.confirmedBy = null;
            } else {
                item.confirmedAt = item.confirmedAt ?? now;
            }
        });
        order.status = status;
        await order.save();

        for (const { productId, quantity } of itemsPendingConfirmStock) {
            try {
                await syncRaffleProgressForProductSale(productId);
            } catch (raffleSyncError) {
                console.error(
                    'syncRaffleProgressForProductSale error:',
                    raffleSyncError,
                );
            }
            try {
                await decrementProductStockOnItemConfirmed(productId, quantity);
            } catch (stockError) {
                console.error('decrementProductStockOnItemConfirmed error:', stockError);
            }
        }

        await order.populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS);
        await order.populate(ORDER_ITEMS_POPULATE);

        return successRes(res, { order });
    } catch (error) {
        console.error('updateOrderStatusController error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении статуса заказа');
    }
};
