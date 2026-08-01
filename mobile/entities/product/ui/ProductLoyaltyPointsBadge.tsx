import { Pressable, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { shouldShowProductLoyaltyPointsBadge } from "@/entities/product/lib/shouldShowProductLoyaltyPointsBadge";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductLoyaltyPointsBadgeStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

type ProductLoyaltyPointsBadgeProps = {
  product: Record<string, unknown>;
  isAuthorized?: boolean;
  variant?: "inline" | "overlay" | "detail";
  onPress?: (payload: { kind: "loyalty"; label: string }) => void;
};

export const ProductLoyaltyPointsBadge = ({
  product,
  isAuthorized = false,
  variant = "inline",
  onPress,
}: ProductLoyaltyPointsBadgeProps) => {
  const styles = useProductLoyaltyPointsBadgeStyles();
  const { isUserDataConfirmed } = useUserAccess();

  if (!shouldShowProductLoyaltyPointsBadge(product)) {
    return null;
  }

  const points = resolveProductLoyaltyPointsPerUnit(product);
  const label =
    variant === "detail"
      ? PRODUCT_CARD_UI.LOYALTY_POINTS_DETAIL(points)
      : !isAuthorized
        ? PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(points)
        : isUserDataConfirmed
          ? PRODUCT_CARD_UI.LOYALTY_POINTS_CONFIRMED(points)
          : PRODUCT_CARD_UI.LOYALTY_POINTS_UNCONFIRMED(points);

  const containerStyle =
    variant === "overlay"
      ? styles.badgeOverlay
      : variant === "detail"
        ? styles.detailBadge
        : styles.badge;
  const textStyle =
    variant === "overlay"
      ? styles.badgeOverlayText
      : variant === "detail"
        ? styles.detailBadgeText
        : styles.badgeText;

  if (typeof onPress === "function") {
    return (
      <Pressable
        style={containerStyle}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => onPress({ kind: "loyalty", label })}
      >
        <AppText style={textStyle} numberOfLines={1}>
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={containerStyle}>
      <AppText style={textStyle} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
};
