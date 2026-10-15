import { isCartDealType } from "@molha/api-contract";

import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants";

type AuctionProduct = {
  productAuctionEnabled?: boolean;
  productAuctionCompletedOnce?: boolean;
  auctionActive?: boolean;
  productModerationStatus?: string;
  productIsAvailable?: boolean;
  productDealType?: unknown;
};

/** Паритет web `resolveAuctionUiState.js`. */
export const resolveAuctionUiState = (product: AuctionProduct | null | undefined) => {
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

  return {
    enabled,
    completedOnce,
    auctionActive,
    showSellerAuctionTab: enabled,
  };
};
