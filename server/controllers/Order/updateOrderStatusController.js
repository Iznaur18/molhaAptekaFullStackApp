import { OrderModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import {
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
} from '../../constants/orderConstants.js';
import { normalizeOrderDocumentForRuntime } from './orderStatus.js';

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

        const now = new Date();
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
        await order.populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS);
        await order.populate(ORDER_ITEMS_POPULATE);

        return successRes(res, { order });
    } catch (error) {
        console.error('updateOrderStatusController error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении статуса заказа');
    }
};
