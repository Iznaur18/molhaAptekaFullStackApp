import {
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_PENDING,
    ORDER_STATUS_SHIPPED,
} from '../constants/orderConstants.js';
import { OrderModel, ProductModel } from '../models/index.js';

/**
 * @param {import('mongoose').Types.ObjectId | string} buyerUserId
 */
export const countMyOrdersActionItems = async (buyerUserId) => {
    const orders = await OrderModel.find({ userBuyerId: buyerUserId })
        .select('items.status')
        .lean();

    let count = 0;
    for (const order of orders) {
        for (const item of order.items ?? []) {
            if (
                item.status === ORDER_STATUS_PENDING ||
                item.status === ORDER_STATUS_SHIPPED ||
                item.status === ORDER_STATUS_DELIVERED
            ) {
                count += 1;
            }
        }
    }
    return count;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
export const countMySalesActionItems = async (sellerUserId) => {
    const productIds = await ProductModel.find({ productSeller: sellerUserId })
        .select('_id')
        .lean();

    if (productIds.length === 0) {
        return 0;
    }

    const ids = productIds.map((row) => row._id);
    const rows = await OrderModel.aggregate([
        { $unwind: '$items' },
        {
            $match: {
                'items.productId': { $in: ids },
                'items.status': {
                    $in: [ORDER_STATUS_PENDING, ORDER_STATUS_SHIPPED],
                },
            },
        },
        { $count: 'count' },
    ]);

    return rows[0]?.count ?? 0;
};
