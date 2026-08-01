import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProductPriceStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "../lib/computeProductDiscountPercent";
import { getProductFieldLabel } from "../lib/productFieldRegistry";
import { ProductLoyaltyPointsBadge } from "./ProductLoyaltyPointsBadge";

type BadgePressPayload =
  | { kind: "discount"; label: string }
  | { kind: "loyalty"; label: string };

type ProductPriceDisplayProps = {
  product: {
    productPrice?: number | null;
    productOldPrice?: number | null;
    discountPercent?: number | null;
    [key: string]: unknown;
  };
  showLabel?: boolean;
  variant?: "card" | "inline" | "detail" | "banner" | "cart";
  /** После скидки, иначе сразу после текущей цены (detail). */
  afterPriceSlot?: ReactNode;
  onDiscountBadgePress?: (payload: BadgePressPayload) => void;
  onLoyaltyBadgePress?: (payload: BadgePressPayload) => void;
};

export const ProductPriceDisplay = ({
  product,
  showLabel = false,
  variant = "card",
  afterPriceSlot = null,
  onDiscountBadgePress,
  onLoyaltyBadgePress,
}: ProductPriceDisplayProps) => {
  const styles = useProductPriceStyles();
  const isAuthorized = useIsAuthorized();
  const hasDiscount = hasProductCatalogDiscount(product);
  const currentPriceText = formatPriceRub(Math.floor(Number(product.productPrice)));
  const isDetail = variant === "detail";
  const isBanner = variant === "banner";
  const isCart = variant === "cart";
  const rootStyle = isDetail
    ? styles.detailRoot
    : isBanner
      ? styles.bannerRoot
      : isCart
        ? styles.cartRoot
        : variant === "inline"
          ? styles.inlineRoot
          : styles.cardRoot;
  const currentStyle = [
    styles.current,
    variant === "card" && styles.cardCurrent,
    isDetail && styles.detailCurrent,
    isBanner && styles.bannerCurrent,
    isCart && styles.cartCurrent,
  ];
  const oldStyle = [
    styles.old,
    variant === "card" && styles.cardOld,
    isDetail && styles.detailOld,
    isBanner && styles.bannerOld,
    isCart && styles.cartOld,
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
      {isDetail ? (
        <ProductDiscountBadge
          product={product}
          variant="detail"
          onPress={onDiscountBadgePress}
        />
      ) : null}
      {isDetail ? (
        <ProductLoyaltyPointsBadge
          product={product}
          variant="detail"
          isAuthorized={isAuthorized}
          onPress={onLoyaltyBadgePress}
        />
      ) : null}
      {isDetail ? afterPriceSlot : null}
    </View>
  );
};

type ProductDiscountBadgeProps = {
  product: {
    productPrice?: number | null;
    productOldPrice?: number | null;
    discountPercent?: number | null;
    [key: string]: unknown;
  };
  variant?: "inline" | "overlay" | "detail" | "banner";
  onPress?: (payload: { kind: "discount"; label: string }) => void;
};

export const ProductDiscountBadge = ({
  product,
  variant = "inline",
  onPress,
}: ProductDiscountBadgeProps) => {
  const styles = useProductPriceStyles();
  const discountPercent = resolveProductDiscountPercent(product);
  if (discountPercent == null || discountPercent < 1) {
    return null;
  }

  const label = PRODUCT_CARD_UI.DISCOUNT_BADGE(discountPercent);
  const badgeStyle =
    variant === "overlay"
      ? [styles.badgeOverlay]
      : variant === "detail"
        ? [styles.detailDiscountBadge]
        : [styles.badge, variant === "banner" && styles.bannerDiscountBadge];
  const textStyle = [
    variant === "overlay"
      ? styles.badgeOverlayText
      : variant === "detail"
        ? styles.detailDiscountText
        : styles.badgeText,
    variant === "banner" && styles.bannerDiscountText,
  ];

  if (typeof onPress === "function") {
    return (
      <Pressable
        style={badgeStyle}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => onPress({ kind: "discount", label })}
      >
        <AppText style={textStyle} numberOfLines={1}>
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={badgeStyle}>
      <AppText style={textStyle} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
};
