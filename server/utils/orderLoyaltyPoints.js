import {
    calculateOrderLineLoyaltyPointsReserve,
    normalizeProductLoyaltyPointsPerUnit,
} from './loyaltyPointsSeller.js';
import {
    buildSellerReserveTotalsFromOrderItems,
    releaseLoyaltyPointsBySellerTotals,
    reserveLoyaltyPointsBySellerTotals,
} from './loyaltyPointsReserve.js';
import { InsufficientLoyaltyPointsError } from './loyaltyPointsSpend.js';

/**
 * @param {{
 *   loyaltyPointsPerUnit: number;
 *   quantity: number;
 * }} params
 */
export const buildOrderLineLoyaltySnapshot = ({
    loyaltyPointsPerUnit,
    quantity,
}) => {
    const loyaltyPointsPerUnitAtOrder =
        normalizeProductLoyaltyPointsPerUnit(loyaltyPointsPerUnit);
    const loyaltyPointsReservedTotal = calculateOrderLineLoyaltyPointsReserve(
        loyaltyPointsPerUnitAtOrder,
        quantity,
    );

    return {
        loyaltyPointsPerUnitAtOrder,
        loyaltyPointsReservedTotal,
        loyaltyPointsReserveReleased: false,
        loyaltyPointsAwarded: false,
        loyaltyPointsEarned: 0,
    };
};

/**
 * @param {Array<Record<string, unknown>>} items
 */
export const reserveLoyaltyPointsForNewOrder = async (items) => {
    const totals = buildSellerReserveTotalsFromOrderItems(items);
    if (totals.length === 0) {
        return;
    }

    try {
        await reserveLoyaltyPointsBySellerTotals(totals);
    } catch (error) {
        if (error instanceof InsufficientLoyaltyPointsError) {
            throw new Error(
                'У продавца недостаточно баллов для бонуса по одному из товаров',
            );
        }
        throw error;
    }
};

/**
 * @param {Array<Record<string, unknown>>} items
 */
export const releaseUnawardedLoyaltyReservesForOrder = async (items) => {
    const totals = buildSellerReserveTotalsFromOrderItems(items);
    if (totals.length === 0) {
        return;
    }
    await releaseLoyaltyPointsBySellerTotals(totals);
};

/**
 * @param {Record<string, unknown>} item
 */
export const markOrderLineLoyaltyReserveReleased = (item) => {
    if (!item || typeof item !== 'object') {
        return;
    }
    item.loyaltyPointsReserveReleased = true;
};
