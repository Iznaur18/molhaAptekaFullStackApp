import { LOYALTY_RUBLES_PER_POINT } from '../constants/loyaltyConstants.js';

/**
 * @param {number} lineAmountRubles unitPriceAtOrder * quantity
 * @returns {number}
 */
export const calculateLoyaltyPointsForLineAmount = (lineAmountRubles) => {
    const amount = Number(lineAmountRubles);
    if (!Number.isFinite(amount) || amount <= 0) {
        return 0;
    }
    return Math.floor(amount / LOYALTY_RUBLES_PER_POINT);
};

/**
 * @param {{ unitPriceAtOrder?: number; quantity?: number }} item
 * @returns {number}
 */
export const calculateLoyaltyPointsForOrderLineItem = (item) => {
    const unitPrice = Number(item?.unitPriceAtOrder);
    const quantity = Number(item?.quantity);
    if (!Number.isFinite(unitPrice) || !Number.isFinite(quantity) || quantity < 1) {
        return 0;
    }
    return calculateLoyaltyPointsForLineAmount(unitPrice * quantity);
};

/**
 * Помечает позицию и возвращает баллы к начислению (0 для не-премиум / мелких сумм).
 * `$inc` на пользователя — в вызывающем коде после успешного `order.save()`.
 *
 * @param {{
 *   order: { items: Array<Record<string, unknown>> };
 *   itemIndex: number;
 *   isPremiumUser: boolean;
 * }} params
 * @returns {number}
 */
export const prepareLoyaltyPointsForConfirmedOrderItem = ({
    order,
    itemIndex,
    isPremiumUser,
}) => {
    const targetItem = order.items[itemIndex];
    if (!targetItem) {
        return 0;
    }

    if (targetItem.loyaltyPointsAwarded) {
        return Number(targetItem.loyaltyPointsEarned) || 0;
    }

    const points = isPremiumUser
        ? calculateLoyaltyPointsForOrderLineItem(targetItem)
        : 0;

    targetItem.loyaltyPointsAwarded = true;
    targetItem.loyaltyPointsEarned = points;

    return points;
};
