import { formatProductWholesaleBadgeLabel } from "@izibuy/shared-lib";

import { getProductCardMineStatusBadge } from "@/entities/product/lib/getProductCardMineStatusBadge";
import { resolveAuctionUiState } from "@/entities/product/lib/resolveAuctionUiState";
import { PRODUCT_CARD_UI } from "@/shared/config";

export type ProductCompactCardFeatureBadgeVariant =
  | "auction"
  | "installment"
  | "wholesale"
  | "raffle"
  | "hidden"
  | "loyaltyOvercommit";

export type ProductCompactCardFeatureBadge = {
  key: string;
  label: string;
  variant: ProductCompactCardFeatureBadgeVariant;
};

type BuildMyProductCompactCardFeatureBadgesParams = {
  product: Record<string, unknown>;
  isLoyaltyPointsOvercommitted?: boolean;
};

export const buildMyProductCompactCardFeatureBadges = ({
  product,
  isLoyaltyPointsOvercommitted = false,
}: BuildMyProductCompactCardFeatureBadgesParams): ProductCompactCardFeatureBadge[] => {
  const badges: ProductCompactCardFeatureBadge[] = [];
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

  const wholesaleLabel = formatProductWholesaleBadgeLabel(product);
  if (wholesaleLabel) {
    badges.push({
      key: "wholesale",
      label: wholesaleLabel,
      variant: "wholesale",
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
};
