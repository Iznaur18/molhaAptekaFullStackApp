import { View } from "react-native";

import { PRODUCT_CARD_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProductPriceStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

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
  variant?: "card" | "inline" | "detail" | "banner";
};

export const ProductPriceDisplay = ({
  product,
  showLabel = false,
  variant = "card",
}: ProductPriceDisplayProps) => {
  const styles = useProductPriceStyles();
  const hasDiscount = hasProductCatalogDiscount(product);
  const currentPriceText = formatPriceRub(Math.floor(Number(product.productPrice)));
  const isDetail = variant === "detail";
  const isBanner = variant === "banner";
  const rootStyle = isDetail
    ? styles.detailRoot
    : isBanner
      ? styles.bannerRoot
      : variant === "inline"
        ? styles.inlineRoot
        : styles.cardRoot;
  const currentStyle = [
    styles.current,
    variant === "card" && styles.cardCurrent,
    isDetail && styles.detailCurrent,
    isBanner && styles.bannerCurrent,
  ];
  const oldStyle = [
    styles.old,
    variant === "card" && styles.cardOld,
    isDetail && styles.detailOld,
    isBanner && styles.bannerOld,
  ];

  return (
    <View style={rootStyle}>
      {showLabel ? (
        <AppText style={styles.label}>{getProductFieldLabel("productPrice")}</AppText>
      ) : null}
      <AppText style={currentStyle} numberOfLines={1}>
        {currentPriceText}
      </AppText>
      {hasDiscount ? (
        <AppText style={oldStyle} numberOfLines={1}>
          {formatPriceRub(Math.floor(Number(product.productOldPrice)))}
        </AppText>
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
  variant?: "inline" | "overlay" | "detail" | "banner";
};

export const ProductDiscountBadge = ({ product, variant = "inline" }: ProductDiscountBadgeProps) => {
  const styles = useProductPriceStyles();
  const discountPercent = resolveProductDiscountPercent(product);
  if (discountPercent == null || discountPercent < 1) {
    return null;
  }

  return (
    <View
      style={
        variant === "overlay"
          ? [styles.badgeOverlay]
          : [
              styles.badge,
              variant === "detail" && styles.detailDiscountBadge,
              variant === "banner" && styles.bannerDiscountBadge,
            ]
      }
    >
      <AppText
        style={[
          variant === "overlay" ? styles.badgeOverlayText : styles.badgeText,
          variant === "detail" && styles.detailDiscountText,
          variant === "banner" && styles.bannerDiscountText,
        ]}
        numberOfLines={1}
      >
        {PRODUCT_CARD_UI.DISCOUNT_BADGE(discountPercent)}
      </AppText>
    </View>
  );
};
