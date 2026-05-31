import { LOYALTY_RUBLES_PER_POINT } from "../constants/loyaltyConstants.js";

/**
 * @param {number} lineAmountRubles
 */
export function calculateLoyaltyPointsForLineAmount(lineAmountRubles) {
  const amount = Number(lineAmountRubles);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.floor(amount / LOYALTY_RUBLES_PER_POINT);
}
