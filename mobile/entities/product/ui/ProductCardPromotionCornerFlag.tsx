import { StyleSheet, View } from "react-native";

import {
  PRODUCT_CARD_PROMOTION_TIER,
  type ProductCardPromotionTier,
} from "@/entities/product/lib/productCardPromotionFramePalette";
import { getProductPromotionTierChrome } from "@/entities/product/lib/productPromotionTierChrome";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { AppText } from "@/shared/ui/AppText";

const TIER_LABEL: Record<ProductCardPromotionTier, string> = {
  [PRODUCT_CARD_PROMOTION_TIER.GOLD]: PRODUCT_CARD_UI.PROMOTED_BADGE,
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE,
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE,
};

type ProductCardPromotionCornerFlagProps = {
  tier: ProductCardPromotionTier;
};

/**
 * Угловая плашка «БУСТ» / «ТОП» / «БАННЕР» в левом верхнем углу фото —
 * цвет тарифа синхронизирован с рамкой продвижения (productPromotionTierChrome).
 */
export const ProductCardPromotionCornerFlag = ({ tier }: ProductCardPromotionCornerFlagProps) => {
  const chrome = getProductPromotionTierChrome(tier);
  const label = TIER_LABEL[tier];

  return (
    <View
      style={[styles.flag, { backgroundColor: chrome.accent, shadowColor: chrome.accent }]}
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <AppText style={styles.text}>{label.toUpperCase()}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  flag: {
    position: "absolute",
    top: 0,
    left: 6,
    zIndex: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  text: {
    color: "#ffffff",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.9,
    lineHeight: 13,
  },
});
