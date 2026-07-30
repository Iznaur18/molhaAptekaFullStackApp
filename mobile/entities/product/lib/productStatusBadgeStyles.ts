import { useMemo } from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import {
  PRODUCT_CARD_BADGE_LAYOUT as BL,
  PRODUCT_CARD_DETAIL_BADGE_LAYOUT as BDETAIL,
  PRODUCT_CARD_STATUS_BADGE_OVERLAY_LAYOUT as BSOL,
  PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE,
  resolveProductCardBadgeColors,
} from "@/entities/product/lib/productCardBadgePalette";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

export type ProductStatusBadgeVariant =
  | "hidden"
  | "promotionBoost"
  | "promotionTop"
  | "promotionBanner"
  | "auction"
  | "installment"
  | "wholesale"
  | "raffle"
  | "placeholder"
  | "loyaltyOvercommit"
  | "promotionActive";

export type ProductStatusBadgeSize = "compact" | "detail";

type BadgeLayout = {
  borderRadius: number;
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
  lineHeight: number;
  rowGap: number;
};

type BadgeStyleOptions = {
  paddingHorizontal?: number;
  paddingVertical?: number;
  fontWeight?: TextStyle["fontWeight"];
};

const resolveBadgeLayout = (size: ProductStatusBadgeSize): BadgeLayout =>
  size === "detail" ? BDETAIL : BSOL;

const createLegacyBadge = (
  borderColor: string,
  backgroundColor: string,
  textColor: string,
  baseText: TextStyle,
  options?: BadgeStyleOptions,
): { badge: ViewStyle; text: TextStyle } => ({
  badge: {
    paddingHorizontal: options?.paddingHorizontal ?? BL.paddingHorizontal,
    paddingVertical: options?.paddingVertical ?? BL.paddingVertical,
    borderRadius: BL.borderRadius,
    borderWidth: 1,
    flexShrink: 0,
    borderColor,
    backgroundColor,
  },
  text: {
    ...baseText,
    color: textColor,
    fontWeight: options?.fontWeight ?? baseText.fontWeight,
  },
});

const createOverlayBadge = (
  layout: BadgeLayout,
  backgroundColor: string,
  textColor: string,
  baseText: TextStyle,
  options?: BadgeStyleOptions,
): { badge: ViewStyle; text: TextStyle } => ({
  badge: {
    paddingHorizontal: options?.paddingHorizontal ?? layout.paddingHorizontal,
    paddingVertical: options?.paddingVertical ?? layout.paddingVertical,
    borderRadius: layout.borderRadius,
    borderWidth: 0,
    flexShrink: 0,
    backgroundColor,
  },
  text: {
    ...baseText,
    color: textColor,
    fontWeight: options?.fontWeight ?? baseText.fontWeight,
  },
});

const createBadge = (
  layout: BadgeLayout,
  baseText: TextStyle,
  borderColor: string,
  backgroundColor: string,
  textColor: string,
  options?: BadgeStyleOptions,
): { badge: ViewStyle; text: TextStyle } =>
  PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
    ? createOverlayBadge(layout, backgroundColor, textColor, baseText, options)
    : createLegacyBadge(borderColor, backgroundColor, textColor, baseText, options);

export const useProductStatusBadgeVariantStyles = (
  size: ProductStatusBadgeSize = "compact",
): Record<ProductStatusBadgeVariant, { badge: ViewStyle; text: TextStyle }> => {
  const theme = useAppTheme();

  return useMemo(() => {
    const layout = resolveBadgeLayout(size);
    /** Detail: солид для всех статус-бейджей (фон ↔ текст). */
    const swapFill = size === "detail";
    const fill = (backgroundColor: string, textColor: string) =>
      swapFill
        ? { backgroundColor: textColor, textColor: backgroundColor }
        : { backgroundColor, textColor };
    const baseText: TextStyle = PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
      ? {
          fontSize: layout.fontSize,
          fontWeight: "800",
          lineHeight: layout.lineHeight,
        }
      : {
          fontSize: BL.fontSize,
          fontWeight: "700",
          lineHeight: BL.lineHeight,
        };
    const overlayInset = {
      paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? layout.paddingHorizontal
        : BL.paddingHorizontalCompact,
      paddingVertical: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? layout.paddingVertical
        : BL.paddingVerticalCompact,
    } as const;
    const overlayWide = {
      paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? layout.paddingHorizontal
        : BL.paddingHorizontalWide,
    } as const;
    const BC = resolveProductCardBadgeColors(theme.colors);
    const hidden = fill(BC.hiddenBg, BC.hiddenText);
    const promotionBoost = fill(BC.promotionBoostBg, BC.promotionBoostText);
    const promotionTop = fill(BC.promotionTopBg, BC.promotionTopText);
    const promotionBanner = fill(BC.promotionBannerBg, BC.promotionBannerText);
    const auction = fill(BC.auctionBg, BC.auctionText);
    const installment = fill(BC.installmentBg, BC.installmentText);
    const wholesale = fill(BC.wholesaleBg, BC.wholesaleText);
    const raffle = fill(BC.raffleBg, BC.raffleText);
    const placeholder = fill(BC.statusPlaceholderBg, BC.statusPlaceholderText);
    const loyaltyOvercommit = fill(theme.colors.dangerSurface, theme.colors.dangerText);
    const promotionActive = fill(BC.promotionBoostBg, BC.promotionBoostText);

    return {
      hidden: createBadge(layout, baseText, "transparent", hidden.backgroundColor, hidden.textColor, {
        ...overlayInset,
        fontWeight: "600",
      }),
      promotionBoost: createBadge(
        layout,
        baseText,
        BC.promotionBoostBorder,
        promotionBoost.backgroundColor,
        promotionBoost.textColor,
        overlayWide,
      ),
      promotionTop: createBadge(
        layout,
        baseText,
        BC.promotionTopBorder,
        promotionTop.backgroundColor,
        promotionTop.textColor,
        overlayWide,
      ),
      promotionBanner: createBadge(
        layout,
        baseText,
        BC.promotionBannerBorder,
        promotionBanner.backgroundColor,
        promotionBanner.textColor,
        overlayWide,
      ),
      auction: createBadge(
        layout,
        baseText,
        BC.auctionBorder,
        auction.backgroundColor,
        auction.textColor,
      ),
      installment: createBadge(
        layout,
        baseText,
        BC.installmentBorder,
        installment.backgroundColor,
        installment.textColor,
      ),
      wholesale: createBadge(
        layout,
        baseText,
        BC.wholesaleBorder,
        wholesale.backgroundColor,
        wholesale.textColor,
      ),
      raffle: createBadge(layout, baseText, BC.raffleBorder, raffle.backgroundColor, raffle.textColor),
      placeholder: createBadge(
        layout,
        baseText,
        BC.statusPlaceholderBorder,
        placeholder.backgroundColor,
        placeholder.textColor,
        {
          ...overlayInset,
          fontWeight: "500",
        },
      ),
      loyaltyOvercommit: createBadge(
        layout,
        baseText,
        `${theme.colors.danger}59`,
        loyaltyOvercommit.backgroundColor,
        loyaltyOvercommit.textColor,
        { fontWeight: "600" },
      ),
      promotionActive: createBadge(
        layout,
        baseText,
        BC.promotionBoostBorder,
        promotionActive.backgroundColor,
        promotionActive.textColor,
        { fontWeight: "600" },
      ),
    };
  }, [size, theme]);
};

const compactScrollStyles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
    maxWidth: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE ? BSOL.rowGap : BL.statusGap,
    minHeight: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
      ? BSOL.lineHeight + BSOL.paddingVertical * 2
      : 21,
  },
});

const detailScrollStyles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
    maxWidth: "100%",
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE ? BDETAIL.rowGap : BL.statusGap,
  },
});

export const getProductStatusBadgeScrollStyles = (size: ProductStatusBadgeSize = "compact") =>
  size === "detail" ? detailScrollStyles : compactScrollStyles;

/** @deprecated use getProductStatusBadgeScrollStyles("compact") */
export const productStatusBadgeScrollStyles = compactScrollStyles;
