/**
 * Баллы за подтверждённую позицию: премиум-покупатель получает замороженную сумму.
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

  const reserved = Math.ceil(Number(targetItem.loyaltyPointsReservedTotal) || 0);
  const points =
    isPremiumUser && reserved > 0 && !targetItem.loyaltyPointsReserveReleased
      ? reserved
      : 0;

  targetItem.loyaltyPointsAwarded = true;
  targetItem.loyaltyPointsEarned = points;

  return points;
};
