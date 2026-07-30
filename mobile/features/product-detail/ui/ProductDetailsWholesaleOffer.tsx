import { resolveProductWholesaleOffer } from "@izibuy/shared-lib";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { PRODUCT_WHOLESALE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsWholesaleOfferProps = {
  product: Record<string, unknown>;
  canShowAddToCart?: boolean;
};

export const ProductDetailsWholesaleOffer = ({
  product,
  canShowAddToCart = true,
}: ProductDetailsWholesaleOfferProps) => {
  const styles = useProductDetailScreenStyles();
  const router = useRouter();
  const isAuthorized = useIsAuthorized();
  const cartQuery = useMyCartQuery();
  const { setItemQuantity, isUpdating } = useCartActions();
  const offer = resolveProductWholesaleOffer(product);
  if (offer == null) {
    return null;
  }

  const productId = product._id != null ? String(product._id) : "";
  const purchaseLimit = getProductPurchaseLimit(product);
  const goDisabled =
    !canShowAddToCart ||
    purchaseLimit < offer.minQty ||
    productId.length === 0 ||
    isUpdating;

  const wholesalePriceLabel = formatPriceRub(offer.wholesalePrice);
  const savingsLabel = formatPriceRub(offer.savingsPerUnit);
  const title = PRODUCT_WHOLESALE_UI.DETAILS_OFFER_KICKER;
  const subtitle = PRODUCT_WHOLESALE_UI.DETAILS_OFFER_SUBTITLE(
    offer.minQty,
    wholesalePriceLabel,
    offer.discountPercent,
  );
  const goLabel = PRODUCT_WHOLESALE_UI.DETAILS_OFFER_GO;
  const accessibilityLabel = [
    PRODUCT_WHOLESALE_UI.DETAILS_OFFER_ARIA,
    subtitle,
    goLabel,
    PRODUCT_WHOLESALE_UI.DETAILS_OFFER_SAVINGS(savingsLabel),
  ].join(". ");

  const handleGoPress = () => {
    if (goDisabled) {
      return;
    }
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    const current = cartQuery.data?.[productId] ?? 0;
    if (current >= offer.minQty) {
      router.push("/(tabs)/cart");
      return;
    }
    const nextQty = Math.min(purchaseLimit, Math.max(current, offer.minQty));
    void setItemQuantity(productId, nextQty);
  };

  return (
    <View
      style={styles.installmentTeaser}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.installmentTeaserCopy}>
        <Text style={styles.installmentTeaserTitle}>{title}</Text>
        <Text style={styles.installmentTeaserMonthly}>{subtitle}</Text>
      </View>
      <Pressable
        onPress={handleGoPress}
        disabled={goDisabled}
        accessibilityRole="button"
        accessibilityLabel={PRODUCT_WHOLESALE_UI.DETAILS_OFFER_GO_ARIA}
        accessibilityState={{ disabled: goDisabled }}
        style={({ pressed }) => [
          styles.installmentTeaserGo,
          goDisabled ? { opacity: 0.45 } : null,
          pressed && !goDisabled ? { opacity: 0.85 } : null,
        ]}
      >
        <Text style={styles.installmentTeaserGoText}>{goLabel}</Text>
      </Pressable>
    </View>
  );
};
