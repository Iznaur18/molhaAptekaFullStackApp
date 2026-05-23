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
 * Сумма `quantity * unitPriceAtOrder` по позициям товаров продавца (confirmed/delivered).
 *
 * @param {string[]} sellerIds
 * @returns {Promise<Record<string, number>>}
 */
export const getTotalSalesAmountBySellerIds = async (sellerIds) => {
    const ids = [
        ...new Set(
            sellerIds
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
                'items.status': { $in: SALE_COUNT_ITEM_STATUSES },
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'productDoc',
            },
        },
        { $unwind: '$productDoc' },
        {
            $match: {
                'productDoc.productSeller': { $in: objectIds },
            },
        },
        {
            $group: {
                _id: '$productDoc.productSeller',
                totalSalesAmount: {
                    $sum: {
                        $multiply: [
                            '$items.quantity',
                            '$items.unitPriceAtOrder',
                        ],
                    },
                },
            },
        },
    ]);

    return Object.fromEntries(
        rows.map((row) => [
            String(row._id),
            Number(row.totalSalesAmount) || 0,
        ]),
    );
};

/**
 * @param {Record<string, unknown>[]} users
 */
export const attachTotalSalesAmountToUsers = async (users) => {
    if (!Array.isArray(users) || users.length === 0) {
        return users;
    }

    const salesBySeller = await getTotalSalesAmountBySellerIds(
        users.map((user) => String(user._id)),
    );

    return users.map((user) => ({
        ...user,
        totalSalesAmount: salesBySeller[String(user._id)] ?? 0,
    }));
};
