import { formatCatalogNearDistanceLabel } from "@molha/api-contract";
import { ScrollView, View } from "react-native";

import { useProductCardChromeFlags } from "@/entities/product/lib/useProductCardChromeFlags";
import { getProductCardMineStatusBadge } from "@/entities/product/lib/getProductCardMineStatusBadge";
import {
  getProductStatusBadgeScrollStyles,
  useProductStatusBadgeVariantStyles,
  type ProductStatusBadgeSize,
  type ProductStatusBadgeVariant,
} from "@/entities/product/lib/productStatusBadgeStyles";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { AppText } from "@/shared/ui/AppText";

type ProductCatalogStatusBadgesProps = {
  product: Record<string, unknown>;
  showHiddenBadge?: boolean;
  showNoStatusPlaceholder?: boolean;
  isMineMode?: boolean;
  isLoyaltyPointsOvercommitted?: boolean;
  size?: ProductStatusBadgeSize;
  /** false — без собственного ScrollView (для общей горизонтальной ленты). */
  scrollable?: boolean;
  showAuctionBadge?: boolean;
  showInstallmentBadge?: boolean;
  showWholesaleBadge?: boolean;
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
  size = "compact",
  scrollable = true,
  showAuctionBadge = true,
  showInstallmentBadge = true,
  showWholesaleBadge = true,
}: ProductCatalogStatusBadgesProps) => {
  const flags = useProductCardChromeFlags(product, { isMineMode });
  const productStatusBadgeVariantStyles = useProductStatusBadgeVariantStyles(size);
  const scrollStyles = getProductStatusBadgeScrollStyles(size);

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
    const nearDistanceLabel = formatCatalogNearDistanceLabel(product.distanceMeters);
    if (nearDistanceLabel) {
      badges.push({
        key: "near",
        label: nearDistanceLabel,
        variant: "near",
      });
    }
    if (flags.showRaffleBadge) {
      badges.push({
        key: "raffle",
        label: PRODUCT_CARD_UI.RAFFLE_BADGE,
        variant: "raffle",
      });
    }
    if (flags.showAffiliateBadge) {
      badges.push({
        key: "affiliate",
        label: PRODUCT_CARD_UI.AFFILIATE_BADGE(flags.affiliatePercent),
        variant: "affiliate",
      });
    }
    if (showAuctionBadge && flags.showAuctionBadge) {
      badges.push({
        key: "auction",
        label: PRODUCT_CARD_UI.AUCTION_BADGE,
        variant: "auction",
      });
    }
    if (showInstallmentBadge && flags.showInstallmentBadge) {
      badges.push({
        key: "installment",
        label: PRODUCT_CARD_UI.INSTALLMENT_BADGE,
        variant: "installment",
      });
    }
    if (showWholesaleBadge && flags.showWholesaleBadge && flags.wholesaleBadgeLabel) {
      badges.push({
        key: "wholesale",
        label: flags.wholesaleBadgeLabel,
        variant: "wholesale",
      });
    }
    if (flags.showPromotionBoostBadge) {
      badges.push({
        key: "promotion-boost",
        label: PRODUCT_CARD_UI.PROMOTED_BADGE,
        variant: "promotionBoost",
      });
    } else if (flags.showPromotionTopBadge) {
      badges.push({
        key: "promotion-top",
        label: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE,
        variant: "promotionTop",
      });
    } else if (flags.showPromotionBannerBadge) {
      badges.push({
        key: "promotion-banner",
        label: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE,
        variant: "promotionBanner",
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

  const badgeNodes = visibleBadges.map((badge) => {
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
  });

  if (!scrollable) {
    return (
      <View style={scrollStyles.content} accessibilityLabel={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}>
        {badgeNodes}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      style={scrollStyles.root}
      contentContainerStyle={scrollStyles.content}
      showsHorizontalScrollIndicator={false}
      {...nestedHorizontalScrollProps}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}
    >
      {badgeNodes}
    </ScrollView>
  );
};
