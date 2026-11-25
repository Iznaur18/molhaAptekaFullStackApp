import { izProductBadgeColors } from "@izibuy/design-tokens";

import { PRODUCT_CARD_DETAIL_BADGE_LAYOUT as BDETAIL } from "@/entities/product/lib/productCardBadgePalette";
import type { ProductStatusBadgeVariant } from "@/entities/product/lib/productStatusBadgeStyles";

/** Мягкая палитра бейджей details (без «Статус цены»). */
export const PRODUCT_DETAILS_BADGE_SOFT_COLORS = izProductBadgeColors.detailsSoft;

type SoftBadgeTone = {
  backgroundColor: string;
  color: string;
};

export const resolveProductDetailsStatusBadgeSoftTone = (
  variant: ProductStatusBadgeVariant,
): SoftBadgeTone | null => {
  switch (variant) {
    case "raffle":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle;
    case "affiliate":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.affiliate;
    case "auction":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.auction;
    case "installment":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.installment;
    case "promotionBoost":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.promotionBoost;
    case "promotionTop":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.promotionTop;
    case "promotionBanner":
      return PRODUCT_DETAILS_BADGE_SOFT_COLORS.promotionBanner;
    default:
      return null;
  }
};

export const PRODUCT_DETAILS_SOFT_BADGE_LAYOUT = {
  paddingHorizontal: BDETAIL.paddingHorizontal,
  paddingVertical: BDETAIL.paddingVertical,
  borderRadius: BDETAIL.borderRadius,
  fontSize: BDETAIL.fontSize,
  lineHeight: BDETAIL.lineHeight,
} as const;
