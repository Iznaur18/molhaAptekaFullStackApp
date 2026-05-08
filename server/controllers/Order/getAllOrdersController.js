import { OrderModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import { normalizeOrderItemsForRuntime } from './orderStatus.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const buildOrdersQuery = ({ status }) => (status ? { status } : {});

/** `GET /order/all` — все заказы (только админ), пагинация и опц. фильтр по `status`. */
export const getAllOrdersController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const ordersQuery = buildOrdersQuery(req.query);

        const [orders, total] = await Promise.all([
            OrderModel.find(ordersQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS)
                .populate(ORDER_ITEMS_POPULATE)
                .lean(),
            OrderModel.countDocuments(ordersQuery),
        ]);
        orders.forEach((order) => normalizeOrderItemsForRuntime(order.items));

        return successRes(res, { orders, total, page, limit });
    } catch (error) {
        console.error('getAllOrdersController error:', error);
        return errorRes(res, 500, 'Ошибка при получении заказов');
    }
};
