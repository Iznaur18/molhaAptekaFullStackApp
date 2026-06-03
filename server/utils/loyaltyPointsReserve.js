import { UserModel } from '../models/index.js';

import { InsufficientLoyaltyPointsError } from './loyaltyPointsSpend.js';
import { getSellerLoyaltyPointsAvailable } from './loyaltyPointsSeller.js';

/**
 * @param {string} userId
 * @param {number} amount
 */
export const reserveLoyaltyPoints = async ({ userId, amount }) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        return;
    }

    const updated = await UserModel.findOneAndUpdate(
        {
            _id: userId,
            $expr: {
                $gte: [
                    {
                        $subtract: [
                            '$userLoyaltyPoints',
                            { $ifNull: ['$userLoyaltyPointsReserved', 0] },
                        ],
                    },
                    normalizedAmount,
                ],
            },
        },
        { $inc: { userLoyaltyPointsReserved: normalizedAmount } },
        { returnDocument: 'after' },
    ).lean();

    if (!updated) {
        const user = await UserModel.findById(userId)
            .select('userLoyaltyPoints userLoyaltyPointsReserved')
            .lean();
        const available = getSellerLoyaltyPointsAvailable(user);
        throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
    }
};

/**
 * @param {string} userId
 * @param {number} amount
 */
export const releaseLoyaltyPointsReservation = async ({ userId, amount }) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        return;
    }

    await UserModel.updateOne(
        {
            _id: userId,
            userLoyaltyPointsReserved: { $gte: normalizedAmount },
        },
        { $inc: { userLoyaltyPointsReserved: -normalizedAmount } },
    );
};

/**
 * @param {{ sellerId: string; buyerId: string; amount: number }} params
 */
export const settleLoyaltyPointsReservation = async ({
    sellerId,
    buyerId,
    amount,
}) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        return;
    }

    const sellerUpdated = await UserModel.findOneAndUpdate(
        {
            _id: sellerId,
            userLoyaltyPoints: { $gte: normalizedAmount },
            userLoyaltyPointsReserved: { $gte: normalizedAmount },
        },
        {
            $inc: {
                userLoyaltyPoints: -normalizedAmount,
                userLoyaltyPointsReserved: -normalizedAmount,
            },
        },
        { returnDocument: 'after' },
    ).lean();

    if (!sellerUpdated) {
        const user = await UserModel.findById(sellerId)
            .select('userLoyaltyPoints userLoyaltyPointsReserved')
            .lean();
        const available = getSellerLoyaltyPointsAvailable(user);
        throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
    }

    await UserModel.updateOne(
        { _id: buyerId },
        { $inc: { userLoyaltyPoints: normalizedAmount } },
    );
};

/**
 * @param {{ sellerId: string; amount: number }[]} totals
 */
export const reserveLoyaltyPointsBySellerTotals = async (totals) => {
    /** @type {{ sellerId: string; amount: number }[]} */
    const applied = [];

    try {
        for (const row of totals) {
            const amount = Math.ceil(Number(row.amount));
            if (amount <= 0) {
                continue;
            }
            await reserveLoyaltyPoints({ userId: row.sellerId, amount });
            applied.push({ sellerId: row.sellerId, amount });
        }
    } catch (error) {
        await releaseLoyaltyPointsBySellerTotals(applied);
        throw error;
    }
};

/**
 * @param {{ sellerId: string; amount: number }[]} totals
 */
export const releaseLoyaltyPointsBySellerTotals = async (totals) => {
    for (const row of totals) {
        try {
            await releaseLoyaltyPointsReservation({
                userId: row.sellerId,
                amount: row.amount,
            });
        } catch (releaseError) {
            console.error('releaseLoyaltyPointsBySellerTotals error:', releaseError);
        }
    }
};

/**
 * @param {Array<{
 *   loyaltyPointsReservedTotal?: number;
 *   loyaltyPointsReserveReleased?: boolean;
 *   loyaltyPointsAwarded?: boolean;
 *   productId?: { productSeller?: unknown } | string;
 * }>} items
 */
export const buildSellerReserveTotalsFromOrderItems = (items) => {
    /** @type {Map<string, number>} */
    const bySeller = new Map();

    for (const item of items) {
        if (item?.loyaltyPointsReserveReleased || item?.loyaltyPointsAwarded) {
            continue;
        }
        const total = Math.ceil(Number(item.loyaltyPointsReservedTotal) || 0);
        if (total <= 0) {
            continue;
        }
        const product = item.productId;
        const sellerRaw =
            product && typeof product === 'object'
                ? product.productSeller?._id ?? product.productSeller
                : null;
        const sellerId = sellerRaw != null ? String(sellerRaw) : '';
        if (!sellerId) {
            continue;
        }
        bySeller.set(sellerId, (bySeller.get(sellerId) ?? 0) + total);
    }

    return [...bySeller.entries()].map(([sellerId, amount]) => ({
        sellerId,
        amount,
    }));
};
