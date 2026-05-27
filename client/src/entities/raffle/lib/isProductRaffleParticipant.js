/**
 * @param {import('../../product/model/types.js').ProductFromApi} product
 */
export function isProductRaffleParticipant(product) {
  return Boolean(product.activeRaffleId && product.raffleParticipationEnabledAt);
}
