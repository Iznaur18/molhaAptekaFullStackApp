import { View } from "react-native";

import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { shouldShowProductLoyaltyPointsBadge } from "@/entities/product/lib/shouldShowProductLoyaltyPointsBadge";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductLoyaltyPointsBadgeStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

type ProductLoyaltyPointsBadgeProps = {
  product: Record<string, unknown>;
  isAuthorized?: boolean;
  isPremiumUser?: boolean;
  variant?: "inline" | "overlay";
};

export const ProductLoyaltyPointsBadge = ({
  product,
  isAuthorized = false,
  isPremiumUser = false,
  variant = "inline",
}: ProductLoyaltyPointsBadgeProps) => {
  const styles = useProductLoyaltyPointsBadgeStyles();

  if (!shouldShowProductLoyaltyPointsBadge(product)) {
    return null;
  }

  const points = resolveProductLoyaltyPointsPerUnit(product);
  const label = !isAuthorized
    ? PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(points)
    : isPremiumUser
      ? PRODUCT_CARD_UI.LOYALTY_POINTS_PREMIUM(points)
      : PRODUCT_CARD_UI.LOYALTY_POINTS_WITH_PREMIUM(points);

  return (
    <View style={[styles.badge, variant === "overlay" && styles.badgeOverlay]}>
      <AppText style={[styles.badgeText, variant === "overlay" && styles.badgeOverlayText]}>
        {label}
      </AppText>
    </View>
  );
};
