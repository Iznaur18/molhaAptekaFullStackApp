import { ScrollView, View } from "react-native";

import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { getProductCardMineStatusBadge } from "@/entities/product/lib/getProductCardMineStatusBadge";
import {
  productStatusBadgeScrollStyles,
  productStatusBadgeVariantStyles,
  type ProductStatusBadgeVariant,
} from "@/entities/product/lib/productStatusBadgeStyles";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { AppText } from "@/shared/ui/AppText";

type ProductCatalogStatusBadgesProps = {
  product: Record<string, unknown>;
  showHiddenBadge?: boolean;
  showNoStatusPlaceholder?: boolean;
  isMineMode?: boolean;
  isLoyaltyPointsOvercommitted?: boolean;
};

type StatusBadgeItem = {
  key: string;
  label: string;
  variant: ProductStatusBadgeVariant;
};

export const ProductCatalogStatusBadges = ({
  product,
  showHiddenBadge = false,
  showNoStatusPlaceholder = true,
  isMineMode = false,
  isLoyaltyPointsOvercommitted = false,
}: ProductCatalogStatusBadgesProps) => {
  const flags = useProductCardChromeFlags(product, { isMineMode });

  const badges: StatusBadgeItem[] = [];
  const mineBadge = isMineMode
    ? getProductCardMineStatusBadge({
        product,
        isLoyaltyPointsOvercommitted,
      })
    : null;

  if (mineBadge) {
    badges.push(mineBadge);
  }

  if (!mineBadge) {
    if (showHiddenBadge && !isMineMode && product.productIsAvailable === false) {
      badges.push({
        key: "hidden",
        label: PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE,
        variant: "hidden",
      });
    }
    if (flags.showAuctionBadge) {
      badges.push({
        key: "auction",
        label: PRODUCT_CARD_UI.AUCTION_BADGE,
        variant: "auction",
      });
    }
    if (flags.showInstallmentBadge) {
      badges.push({
        key: "installment",
        label: PRODUCT_CARD_UI.INSTALLMENT_BADGE,
        variant: "installment",
      });
    }
    if (flags.showRaffleBadge) {
      badges.push({
        key: "raffle",
        label: PRODUCT_CARD_UI.RAFFLE_BADGE,
        variant: "raffle",
      });
    }
  }

  const visibleBadges =
    badges.length > 0
      ? badges
      : showNoStatusPlaceholder
        ? [
            {
              key: "placeholder",
              label: PRODUCT_CARD_UI.NO_STATUS_BADGE,
              variant: "placeholder" as const,
            },
          ]
        : [];

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      style={productStatusBadgeScrollStyles.root}
      contentContainerStyle={productStatusBadgeScrollStyles.content}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      directionalLockEnabled
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}
    >
      {visibleBadges.map((badge) => {
        const variantStyle = productStatusBadgeVariantStyles[badge.variant];
        return (
          <View
            key={badge.key}
            style={variantStyle.badge}
            accessibilityRole="text"
            accessibilityLabel={
              badge.variant === "placeholder" ? PRODUCT_CARD_UI.NO_STATUS_BADGE : badge.label
            }
          >
            <AppText style={variantStyle.text}>{badge.label}</AppText>
          </View>
        );
      })}
    </ScrollView>
  );
};
