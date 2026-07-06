import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import {
  PRODUCT_CARD_BADGE_COLORS as BC,
  PRODUCT_CARD_BADGE_LAYOUT as BL,
  PRODUCT_CARD_STATUS_BADGE_OVERLAY_LAYOUT as BSOL,
  PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE,
} from "@/entities/product/lib/productCardBadgePalette";

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

export const productStatusBadgeVariantStyles: Record<
  ProductStatusBadgeVariant,
  { badge: ViewStyle; text: TextStyle }
> = {
  hidden: createBadge("transparent", BC.hiddenBg, BC.hiddenText, {
    paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
      ? BSOL.paddingHorizontal
      : BL.paddingHorizontalCompact,
    paddingVertical: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
      ? BSOL.paddingVertical
      : BL.paddingVerticalCompact,
    fontWeight: "600",
  }),
  promotionBoost: createBadge(
    BC.promotionBoostBorder,
    BC.promotionBoostBg,
    BC.promotionBoostText,
    {
      paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? BSOL.paddingHorizontal
        : BL.paddingHorizontalWide,
    },
  ),
  promotionTop: createBadge(
    BC.promotionTopBorder,
    BC.promotionTopBg,
    BC.promotionTopText,
    {
      paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? BSOL.paddingHorizontal
        : BL.paddingHorizontalWide,
    },
  ),
  promotionBanner: createBadge(
    BC.promotionBannerBorder,
    BC.promotionBannerBg,
    BC.promotionBannerText,
    {
      paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? BSOL.paddingHorizontal
        : BL.paddingHorizontalWide,
    },
  ),
  auction: createBadge(BC.auctionBorder, BC.auctionBg, BC.auctionText),
  installment: createBadge(BC.installmentBorder, BC.installmentBg, BC.installmentText),
  raffle: createBadge(BC.raffleBorder, BC.raffleBg, BC.raffleText, { fontWeight: "600" }),
  placeholder: createBadge(
    BC.statusPlaceholderBorder,
    BC.statusPlaceholderBg,
    BC.statusPlaceholderText,
    {
      paddingHorizontal: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? BSOL.paddingHorizontal
        : BL.paddingHorizontalCompact,
      paddingVertical: PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE
        ? BSOL.paddingVertical
        : BL.paddingVerticalCompact,
      fontWeight: "500",
    },
  ),
  loyaltyOvercommit: createBadge("rgba(220, 38, 38, 0.35)", "rgba(254, 226, 226, 0.95)", "#991b1b", {
    fontWeight: "600",
  }),
  promotionActive: createBadge(
    BC.promotionBoostBorder,
    BC.promotionBoostBg,
    BC.promotionBoostText,
    { fontWeight: "600" },
  ),
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
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: statusBadgeRowGap,
    minHeight: statusBadgeRowMinHeight,
    paddingRight: statusBadgeRowGap,
  },
});
