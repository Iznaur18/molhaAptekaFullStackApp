import { rublesToLoyaltyPoints } from "../../../shared/config/loyaltyPointsConstants.js";

export function calculateProductPromotionPointsCost(priceRub) {
  return rublesToLoyaltyPoints(priceRub);
}
