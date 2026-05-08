import { OrderModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

import { ORDER_ITEMS_POPULATE } from './orderQueries.js';
import { normalizeOrderItemsForRuntime } from './orderStatus.js';

/** `GET /order` — список своих заказов (по `req.userId`), сортировка по дате. */
export const getMyOrdersController = async (req, res) => {
    try {
        const orders = await OrderModel.find({ userBuyerId: req.userId })
            .sort({ createdAt: -1 })
            .populate(ORDER_ITEMS_POPULATE)
            .lean();
        orders.forEach((order) => normalizeOrderItemsForRuntime(order.items));

        return successRes(res, { orders });
    } catch (error) {
        console.error('getMyOrdersController error:', error);
        return errorRes(res, 500, 'Ошибка при получении заказов');
    }
};
