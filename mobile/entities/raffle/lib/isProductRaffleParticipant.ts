export const isProductRaffleParticipant = (product: Record<string, unknown>): boolean =>
  Boolean(product.activeRaffleId && product.raffleParticipationEnabledAt);
