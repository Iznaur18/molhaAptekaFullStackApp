import { isCartDealType } from "@molha/api-contract";

import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function resolveAuctionUiState(product) {
  // Авто, недвижимость, услуги: принятая ставка оформляется заказом, а заказ
  // у них запрещён — торг ведут в заявке, аукциона нет вовсе.
  const dealAllowsAuction = isCartDealType(product?.productDealType);
  const enabled = dealAllowsAuction && product?.productAuctionEnabled === true;
  const completedOnce = product?.productAuctionCompletedOnce === true;
  const auctionActive =
    dealAllowsAuction &&
    (product?.auctionActive === true ||
      (enabled &&
        product?.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
        product?.productIsAvailable !== false));

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
