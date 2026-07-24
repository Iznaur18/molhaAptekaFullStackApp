import { getProductCardMineStatusBadge } from "./getProductCardMineStatusBadge.js";
import { resolveAuctionUiState } from "./resolveAuctionUiState.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   isLoyaltyPointsOvercommitted?: boolean;
 * }} params
 * @returns {Array<{ key: string; label: string; variant: string }>}
 */
export function buildMyProductCompactCardFeatureBadges({
  product,
  isLoyaltyPointsOvercommitted = false,
}) {
  const badges = [];
  const { auctionActive } = resolveAuctionUiState(product);

  if (Boolean(product.activeRaffleId) && Boolean(product.raffleParticipationEnabledAt)) {
    badges.push({
      key: "raffle",
      label: PRODUCT_CARD_UI.RAFFLE_BADGE,
      variant: "raffle",
    });
  }

  if (auctionActive) {
    badges.push({
      key: "auction",
      label: PRODUCT_CARD_UI.AUCTION_BADGE,
      variant: "auction",
    });
  }

  if (product.productInstallmentEnabled === true) {
    badges.push({
      key: "installment",
      label: PRODUCT_CARD_UI.INSTALLMENT_BADGE,
      variant: "installment",
    });
  }

  const mineBadge = getProductCardMineStatusBadge({
    product,
    isLoyaltyPointsOvercommitted,
  });

  if (mineBadge?.variant === "hidden") {
    badges.push({
      key: "hidden",
      label: mineBadge.label,
      variant: "hidden",
    });
  }

  if (mineBadge?.variant === "loyaltyOvercommit") {
    badges.push({
      key: "loyalty-overcommit",
      label: mineBadge.label,
      variant: "loyaltyOvercommit",
    });
  }

  return badges;
}
