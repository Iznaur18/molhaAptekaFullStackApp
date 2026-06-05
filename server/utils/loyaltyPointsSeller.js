/**
 * @param {unknown} raw
 */
export const normalizeProductLoyaltyPointsPerUnit = (raw) => {
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
};

/**
 * @param {number} perUnit
 * @param {number} quantity
 */
export const calculateOrderLineLoyaltyPointsReserve = (perUnit, quantity) => {
  const unit = normalizeProductLoyaltyPointsPerUnit(perUnit);
  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty < 1) {
    return 0;
  }
  return unit * qty;
};

/**
 * @param {{ userLoyaltyPoints?: number; userLoyaltyPointsReserved?: number }} user
 */
export const getSellerLoyaltyPointsAvailable = (user) => {
  const total = Number(user?.userLoyaltyPoints) || 0;
  const reserved = Number(user?.userLoyaltyPointsReserved) || 0;
  return Math.max(0, total - reserved);
};
