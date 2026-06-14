import { Text, View } from "react-native";

import { PRODUCT_CARD_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProductPriceStyles } from "@/shared/theme/catalogProductStyles";

import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "../lib/computeProductDiscountPercent";
import { getProductFieldLabel } from "../lib/productFieldRegistry";

type ProductPriceDisplayProps = {
  product: {
    productPrice?: number | null;
    productOldPrice?: number | null;
    discountPercent?: number | null;
  };
  showLabel?: boolean;
  variant?: "card" | "inline";
};

export const ProductPriceDisplay = ({
  product,
  showLabel = false,
  variant = "card",
}: ProductPriceDisplayProps) => {
  const styles = useProductPriceStyles();
  const hasDiscount = hasProductCatalogDiscount(product);
  const currentPriceText = formatPriceRub(Math.floor(Number(product.productPrice)));

  return (
    <View style={variant === "inline" ? styles.inlineRoot : styles.cardRoot}>
      {showLabel ? <Text style={styles.label}>{getProductFieldLabel("productPrice")}</Text> : null}
      <Text style={[styles.current, variant === "card" && styles.cardCurrent]}>
        {currentPriceText}
      </Text>
      {hasDiscount ? (
        <Text style={styles.old}>{formatPriceRub(Math.floor(Number(product.productOldPrice)))}</Text>
      ) : null}
    </View>
  );
};

type ProductDiscountBadgeProps = {
  product: {
    productPrice?: number | null;
    productOldPrice?: number | null;
    discountPercent?: number | null;
  };
  variant?: "inline" | "overlay";
};

export const ProductDiscountBadge = ({ product, variant = "inline" }: ProductDiscountBadgeProps) => {
  const styles = useProductPriceStyles();
  const discountPercent = resolveProductDiscountPercent(product);
  if (discountPercent == null || discountPercent < 1) {
    return null;
  }

  return (
    <View style={[styles.badge, variant === "overlay" && styles.badgeOverlay]}>
      <Text style={styles.badgeText}>{PRODUCT_CARD_UI.DISCOUNT_BADGE(discountPercent)}</Text>
    </View>
  );
};
