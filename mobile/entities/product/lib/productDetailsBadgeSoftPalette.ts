import {
  PRODUCT_CARD_DETAIL_BADGE_LAYOUT as BDETAIL,
} from "@/entities/product/lib/productCardBadgePalette";
import type { ProductStatusBadgeVariant } from "@/entities/product/lib/productStatusBadgeStyles";

/** Мягкая палитра бейджей details (без «Статус цены»). */
export const PRODUCT_DETAILS_BADGE_SOFT_COLORS = {
  discount: { backgroundColor: "#ffe4e6", color: "#be123c" },
  loyalty: { backgroundColor: "#fef3c7", color: "#b45309" },
  raffle: { backgroundColor: "#fce7f3", color: "#9d174d" },
  auction: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  installment: { backgroundColor: "#ccfbf1", color: "#0f766e" },
  promotionBoost: { backgroundColor: "#ffedd5", color: "#c2410c" },
  promotionTop: { backgroundColor: "#f2eff7", color: "#6d28d9" },
  promotionBanner: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  listingOrigin: { backgroundColor: "#e0f2fe", color: "#0369a1" },
  affiliate: { backgroundColor: "#ecfdf5", color: "#047857" },
  wholesale: { backgroundColor: "#e0e7ff", color: "#3730a3" },
  nearDistance: { backgroundColor: "#f1f5f9", color: "#334155" },
} as const;

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
