import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function resolveAuctionUiState(product) {
  const enabled = product?.productAuctionEnabled === true;
  const completedOnce = product?.productAuctionCompletedOnce === true;
  const auctionActive =
    product?.auctionActive === true ||
    (enabled &&
      product?.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
      product?.productIsAvailable !== false);

  let buyerMessage = null;
  if (!auctionActive) {
    buyerMessage = completedOnce ? "ended" : "notHeld";
  }

  return {
    enabled,
    completedOnce,
    auctionActive,
    buyerMessage,
    showSellerAuctionTab: enabled,
    showSellerArchive: completedOnce && !auctionActive,
  };
}
