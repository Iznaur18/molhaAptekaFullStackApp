import { resolveAuctionUiState } from "./resolveAuctionUiState.js";
import { resolveProductCatalogPriceRub } from "./resolveProductCatalogPriceRub.js";
import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function shouldShowProductLoyaltyPointsBadge(product) {
  if (!product) {
    return false;
  }

  const { auctionActive } = resolveAuctionUiState(product);
  if (auctionActive) {
    return false;
  }

  if (resolveProductCatalogPriceRub(product) == null) {
    return false;
  }

  return resolveProductLoyaltyPointsPerUnit(product) > 0;
}
