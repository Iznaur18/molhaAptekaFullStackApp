import mongoose from 'mongoose';

import {
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
} from '../constants/orderConstants.js';
import { OrderModel } from '../models/index.js';

const PURCHASE_COUNT_ITEM_STATUSES = [
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_CONFIRMED,
];

/**
 * Сумма `quantity * unitPriceAtOrder` по купленным позициям (confirmed/delivered).
 *
 * @param {string[]} buyerIds
 * @returns {Promise<Record<string, number>>}
 */
export const getTotalPurchasesAmountByBuyerIds = async (buyerIds) => {
    const ids = [
        ...new Set(
            buyerIds
                .map((id) => String(id))
                .filter((id) => mongoose.isValidObjectId(id)),
        ),
    ];

    if (ids.length === 0) {
        return {};
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const rows = await OrderModel.aggregate([
        {
            $match: {
                userBuyerId: { $in: objectIds },
            },
        },
        { $unwind: '$items' },
        {
            $match: {
                'items.status': { $in: PURCHASE_COUNT_ITEM_STATUSES },
            },
        },
        {
            $group: {
                _id: '$userBuyerId',
                totalPurchasesAmount: {
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
            Number(row.totalPurchasesAmount) || 0,
        ]),
    );
};

/**
 * @param {Record<string, unknown>[]} users
 */
export const attachTotalPurchasesAmountToUsers = async (users) => {
    if (!Array.isArray(users) || users.length === 0) {
        return users;
    }

    const purchasesByBuyer = await getTotalPurchasesAmountByBuyerIds(
        users.map((user) => String(user._id)),
    );

    return users.map((user) => ({
        ...user,
        totalPurchasesAmount: purchasesByBuyer[String(user._id)] ?? 0,
    }));
};
