import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants";

type AuctionProduct = {
  productAuctionEnabled?: boolean;
  productAuctionCompletedOnce?: boolean;
  auctionActive?: boolean;
  productModerationStatus?: string;
  productIsAvailable?: boolean;
};

export const resolveAuctionUiState = (product: AuctionProduct | null | undefined) => {
  const enabled = product?.productAuctionEnabled === true;
  const completedOnce = product?.productAuctionCompletedOnce === true;
  const auctionActive =
    product?.auctionActive === true ||
    (enabled &&
      product?.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
      product?.productIsAvailable !== false);

  return {
    enabled,
    completedOnce,
    auctionActive,
    showSellerAuctionTab: enabled,
  };
};
