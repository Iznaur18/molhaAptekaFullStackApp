import { useMemo } from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import {
  PRODUCT_CARD_BADGE_LAYOUT as BL,
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
  | "raffle"
  | "placeholder"
  | "loyaltyOvercommit"
  | "promotionActive";

type BadgeStyleOptions = {
  paddingHorizontal?: number;
  paddingVertical?: number;
  fontWeight?: TextStyle["fontWeight"];
};

const legacyBaseText: TextStyle = {
  fontSize: BL.fontSize,
  fontWeight: "700",
  lineHeight: BL.lineHeight,
};

const overlayBaseText: TextStyle = {
  fontSize: BSOL.fontSize,
  fontWeight: "800",
  lineHeight: BSOL.lineHeight,
};

const createLegacyBadge = (
  borderColor: string,
  backgroundColor: string,
  textColor: string,
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
    ...legacyBaseText,
    color: textColor,
    fontWeight: options?.fontWeight ?? legacyBaseText.fontWeight,
  },
});

const createOverlayBadge = (
  backgroundColor: string,
  textColor: string,
  options?: BadgeStyleOptions,
): { badge: ViewStyle; text: TextStyle } => ({
  badge: {
    paddingHorizontal: options?.paddingHorizontal ?? BSOL.paddingHorizontal,
    paddingVertical: options?.paddingVertical ?? BSOL.paddingVertical,
    borderRadius: BSOL.borderRadius,
    borderWidth: 0,
    flexShrink: 0,
    backgroundColor,
  },
  text: {
    ...overlayBaseText,
    color: textColor,
    fontWeight: options?.fontWeight ?? overlayBaseText.fontWeight,
  },
});

const createBadge = (
  borderColor: string,
  backgroundColor: string,
  textColor: string,
  options?: BadgeStyleOptions,
): { badge: ViewStyle; text: TextStyle } =>
  PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
    ? createOverlayBadge(backgroundColor, textColor, options)
    : createLegacyBadge(borderColor, backgroundColor, textColor, options);

const overlayInset = {
  paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
    ? BSOL.paddingHorizontal
    : BL.paddingHorizontalCompact,
  paddingVertical: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
    ? BSOL.paddingVertical
    : BL.paddingVerticalCompact,
} as const;

const overlayWide = {
  paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
    ? BSOL.paddingHorizontal
    : BL.paddingHorizontalWide,
} as const;

export const useProductStatusBadgeVariantStyles = (): Record<
  ProductStatusBadgeVariant,
  { badge: ViewStyle; text: TextStyle }
> => {
  const theme = useAppTheme();

  return useMemo(() => {
    const BC = resolveProductCardBadgeColors(theme.colors);
    return {
      hidden: createBadge("transparent", BC.hiddenBg, BC.hiddenText, {
        ...overlayInset,
        fontWeight: "600",
      }),
      promotionBoost: createBadge(
        BC.promotionBoostBorder,
        BC.promotionBoostBg,
        BC.promotionBoostText,
        overlayWide,
      ),
      promotionTop: createBadge(
        BC.promotionTopBorder,
        BC.promotionTopBg,
        BC.promotionTopText,
        overlayWide,
      ),
      promotionBanner: createBadge(
        BC.promotionBannerBorder,
        BC.promotionBannerBg,
        BC.promotionBannerText,
        overlayWide,
      ),
      auction: createBadge(BC.auctionBorder, BC.auctionBg, BC.auctionText),
      installment: createBadge(BC.installmentBorder, BC.installmentBg, BC.installmentText),
      raffle: createBadge(BC.raffleBorder, BC.raffleBg, BC.raffleText, { fontWeight: "600" }),
      placeholder: createBadge(
        BC.statusPlaceholderBorder,
        BC.statusPlaceholderBg,
        BC.statusPlaceholderText,
        {
          ...overlayInset,
          fontWeight: "500",
        },
      ),
      loyaltyOvercommit: createBadge(
        `${theme.colors.danger}59`,
        theme.colors.dangerSurface,
        theme.colors.dangerText,
        { fontWeight: "600" },
      ),
      promotionActive: createBadge(
        BC.promotionBoostBorder,
        BC.promotionBoostBg,
        BC.promotionBoostText,
        { fontWeight: "600" },
      ),
    };
  }, [theme]);
};

const statusBadgeRowGap = PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
  ? BSOL.rowGap
  : BL.statusGap;

const statusBadgeRowMinHeight = PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
  ? BSOL.lineHeight + BSOL.paddingVertical * 2
  : 21;

export const productStatusBadgeScrollStyles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
    maxWidth: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: statusBadgeRowGap,
    minHeight: statusBadgeRowMinHeight,
  },
});
