import { Text, View } from "react-native";

import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductStatusBadgeStyles } from "@/shared/theme/catalogProductStyles";

import { useProductCardChromeFlags } from "../lib/useProductCardChromeFlags";
import { resolveProductLoyaltyPointsPerUnit } from "../lib/resolveProductLoyaltyPointsPerUnit";

type ProductCatalogStatusBadgesProps = {
  product: Record<string, unknown>;
  isPremiumUser?: boolean;
};

export const ProductCatalogStatusBadges = ({
  product,
  isPremiumUser = false,
}: ProductCatalogStatusBadgesProps) => {
  const styles = useProductStatusBadgeStyles();
  const flags = useProductCardChromeFlags(product);
  const loyaltyPoints = resolveProductLoyaltyPointsPerUnit(product);

  const badges: string[] = [];
  if (flags.showPromotionBoostBadge) badges.push(PRODUCT_CARD_UI.PROMOTED_BADGE);
  if (flags.showPromotionTopBadge) badges.push(PRODUCT_CARD_UI.PROMOTION_TOP_BADGE);
  if (flags.showPromotionBannerBadge) badges.push(PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE);
  if (flags.showAuctionBadge) badges.push(PRODUCT_CARD_UI.AUCTION_BADGE);
  if (flags.showInstallmentBadge) badges.push(PRODUCT_CARD_UI.INSTALLMENT_BADGE);
  if (flags.showRaffleBadge) badges.push(PRODUCT_CARD_UI.RAFFLE_BADGE);
  if (flags.showLoyaltyPointsBadge) {
    badges.push(
      isPremiumUser
        ? PRODUCT_CARD_UI.LOYALTY_POINTS_PREMIUM(loyaltyPoints)
        : PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(loyaltyPoints),
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <View style={styles.root} accessibilityLabel={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}>
      {badges.map((label) => (
        <View key={label} style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
      ))}
    </View>
  );
};
