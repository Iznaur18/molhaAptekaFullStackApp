import { StyleSheet, Text, View } from "react-native";

import { PRODUCT_CARD_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";

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
  const hasDiscount = hasProductCatalogDiscount(product);
  const currentPriceText = formatPriceRub(Math.floor(Number(product.productPrice)));

  return (
    <View style={variant === "inline" ? styles.inlineRoot : styles.cardRoot}>
      {showLabel ? (
        <Text style={styles.label}>{getProductFieldLabel("productPrice")}</Text>
      ) : null}
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

const styles = StyleSheet.create({
  cardRoot: {
    gap: 2,
  },
  inlineRoot: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  current: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  cardCurrent: {
    fontSize: 15,
    fontWeight: "700",
  },
  old: {
    fontSize: 14,
    color: "#888",
    textDecorationLine: "line-through",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#c62828",
  },
  badgeOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
