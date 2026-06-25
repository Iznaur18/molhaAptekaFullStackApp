import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import {
  PRODUCT_CARD_BADGE_COLORS as BC,
  PRODUCT_CARD_BADGE_LAYOUT as BL,
} from "@/entities/product/lib/productCardBadgePalette";

export type ProductStatusBadgeVariant =
  | "hidden"
  | "promotionBoost"
  | "promotionTop"
  | "promotionBanner"
  | "auction"
  | "installment"
  | "raffle"
  | "placeholder";

const baseText: TextStyle = {
  fontSize: BL.fontSize,
  fontWeight: "700",
  lineHeight: BL.lineHeight,
};

const createBadge = (
  borderColor: string,
  backgroundColor: string,
  textColor: string,
  options?: {
    paddingHorizontal?: number;
    paddingVertical?: number;
    fontWeight?: TextStyle["fontWeight"];
  },
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

export const productStatusBadgeVariantStyles: Record<
  ProductStatusBadgeVariant,
  { badge: ViewStyle; text: TextStyle }
> = {
  hidden: createBadge("transparent", BC.hiddenBg, BC.hiddenText, {
    paddingHorizontal: BL.paddingHorizontalCompact,
    paddingVertical: BL.paddingVerticalCompact,
    fontWeight: "600",
  }),
  promotionBoost: createBadge(
    BC.promotionBoostBorder,
    BC.promotionBoostBg,
    BC.promotionBoostText,
    { paddingHorizontal: BL.paddingHorizontalWide },
  ),
  promotionTop: createBadge(
    BC.promotionTopBorder,
    BC.promotionTopBg,
    BC.promotionTopText,
    { paddingHorizontal: BL.paddingHorizontalWide },
  ),
  promotionBanner: createBadge(
    BC.promotionBannerBorder,
    BC.promotionBannerBg,
    BC.promotionBannerText,
    { paddingHorizontal: BL.paddingHorizontalWide },
  ),
  auction: createBadge(BC.auctionBorder, BC.auctionBg, BC.auctionText),
  installment: createBadge(BC.installmentBorder, BC.installmentBg, BC.installmentText),
  raffle: createBadge(BC.raffleBorder, BC.raffleBg, BC.raffleText, { fontWeight: "600" }),
  placeholder: createBadge(
    BC.statusPlaceholderBorder,
    BC.statusPlaceholderBg,
    BC.statusPlaceholderText,
    {
      paddingHorizontal: BL.paddingHorizontalCompact,
      paddingVertical: BL.paddingVerticalCompact,
      fontWeight: "500",
    },
  ),
};

export const productStatusBadgeScrollStyles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: BL.statusGap,
    minHeight: 21,
  },
});
