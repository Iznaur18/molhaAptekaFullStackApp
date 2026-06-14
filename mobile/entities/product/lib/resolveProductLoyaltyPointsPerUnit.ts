export const resolveProductLoyaltyPointsPerUnit = (product: unknown): number => {
  const value = Math.floor(Number((product as { loyaltyPointsPerUnit?: number })?.loyaltyPointsPerUnit));
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
};
