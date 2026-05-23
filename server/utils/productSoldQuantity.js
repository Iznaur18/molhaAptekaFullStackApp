import mongoose from 'mongoose';

import {
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
} from '../constants/orderConstants.js';
import { OrderModel } from '../models/index.js';

const SALE_COUNT_ITEM_STATUSES = [
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_CONFIRMED,
];

/**
 * @param {string[]} productIds
 * @returns {Promise<Record<string, number>>}
 */
export const getSoldQuantityByProductIds = async (productIds) => {
    const ids = [
        ...new Set(
            productIds
                .map((id) => String(id))
                .filter((id) => mongoose.isValidObjectId(id)),
        ),
    ];

    if (ids.length === 0) {
        return {};
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const rows = await OrderModel.aggregate([
        { $unwind: '$items' },
        {
            $match: {
                'items.productId': { $in: objectIds },
                'items.status': { $in: SALE_COUNT_ITEM_STATUSES },
            },
        },
        {
            $group: {
                _id: '$items.productId',
                soldQuantity: { $sum: '$items.quantity' },
            },
        },
    ]);

    return Object.fromEntries(
        rows.map((row) => [String(row._id), Number(row.soldQuantity) || 0]),
    );
};

/**
 * @param {{ productId: string; product: Record<string, unknown> | null }[]} items
 */
export const attachSoldQuantityToPurchaseItems = async (items) => {
    const soldById = await getSoldQuantityByProductIds(
        items.map((item) => item.productId),
    );

    return items.map((item) => {
        const soldQuantity = soldById[item.productId] ?? 0;
        if (item.product == null) {
            return { ...item, soldQuantity };
        }
        return {
            ...item,
            soldQuantity,
            product: { ...item.product, soldQuantity },
        };
    });
};
