import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { getProductPromotionTierLabel } from "@/entities/product/lib/calculateProductPromotionPointsCost";
import {
  formatPromotionExpiresAt,
  isCatalogPromotionActive,
} from "@/entities/product/lib/productPromotionStatus";
import type { ProductStatusBadgeVariant } from "@/entities/product/lib/productStatusBadgeStyles";
import { PRODUCT_CARD_UI } from "@/shared/config";

export type ProductCardMineStatusBadge = {
  key: string;
  label: string;
  variant: ProductStatusBadgeVariant | "loyaltyOvercommit" | "promotionActive";
};

type GetProductCardMineStatusBadgeParams = {
  product: Record<string, unknown>;
  isLoyaltyPointsOvercommitted?: boolean;
};

export const getProductCardMineStatusBadge = ({
  product,
  isLoyaltyPointsOvercommitted = false,
}: GetProductCardMineStatusBadgeParams): ProductCardMineStatusBadge | null => {
  const purchaseLimit = getProductPurchaseLimit(product);

  if (product.productIsAvailable === false || purchaseLimit === 0) {
    return {
      key: "hidden",
      label: PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE,
      variant: "hidden",
    };
  }

  if (isCatalogPromotionActive(product)) {
    const tierLabel = getProductPromotionTierLabel(Number(product.catalogPromotionTier) || 0);
    const until = formatPromotionExpiresAt(
      product.catalogPromotionExpiresAt as string | null | undefined,
    );
    return {
      key: "promotion-active",
      label: PRODUCT_CARD_UI.PROMOTED_TIER_UNTIL(tierLabel, until),
      variant: "promotionActive",
    };
  }

  if (isLoyaltyPointsOvercommitted) {
    return {
      key: "loyalty-overcommit",
      label: PRODUCT_CARD_UI.LOYALTY_POINTS_OVERCOMMITTED_BADGE,
      variant: "loyaltyOvercommit",
    };
  }

  return null;
};
