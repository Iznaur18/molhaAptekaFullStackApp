import { semanticColors } from "@/shared/theme/semanticColors";

/** Синхронизировано с client product-card/ProductCardBadges.css + ProductPriceDisplay.css */
export const PRODUCT_CARD_BADGE_COLORS = {
  discountBorder: semanticColors.dangerSurface,
  discountBg: semanticColors.dangerSurface,
  discountText: semanticColors.dangerText,
  loyaltyBorder: `${semanticColors.success}73`,
  loyaltyBg: semanticColors.successSurface,
  loyaltyText: semanticColors.successText,
  hiddenBg: semanticColors.warningSurface,
  hiddenText: semanticColors.warningText,
  promotionBoostBorder: `${semanticColors.warning}73`,
  promotionBoostBg: semanticColors.warningSurface,
  promotionBoostText: semanticColors.warningText,
  promotionTopBorder: `${semanticColors.accent}73`,
  promotionTopBg: semanticColors.accentSoft,
  promotionTopText: semanticColors.accent,
  promotionBannerBorder: `${semanticColors.danger}73`,
  promotionBannerBg: semanticColors.dangerSurface,
  promotionBannerText: semanticColors.dangerText,
  auctionBorder: `${semanticColors.info}66`,
  auctionBg: semanticColors.infoSoft,
  auctionText: semanticColors.info,
  installmentBorder: `${semanticColors.success}66`,
  installmentBg: semanticColors.successSurface,
  installmentText: semanticColors.successText,
  raffleBorder: `${semanticColors.accent}66`,
  raffleBg: semanticColors.accentSoft,
  raffleText: semanticColors.accent,
  statusPlaceholderBorder: semanticColors.border,
  statusPlaceholderBg: semanticColors.surfaceMuted,
  statusPlaceholderText: `${semanticColors.text}7a`,
  priceCurrent: semanticColors.action,
  rating: semanticColors.warning,
  ratingPlaceholder: `${semanticColors.text}7a`,
} as const;

/** Ozon-стиль: непрозрачные пастельные плашки с ярким жирным текстом поверх фото. */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY = {
  borderColor: "transparent",
  shadowColor: "transparent",
  discountBackground: semanticColors.dangerSurface,
  discountText: semanticColors.danger,
  loyaltyBackground: semanticColors.accentSoft,
  loyaltyText: semanticColors.accent,
} as const;

/** Ozon-стиль: стопка плашек флеш к левому краю фото, скругление только справа. */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT = {
  borderRadius: 6,
  paddingVertical: 2,
  paddingHorizontal: 10,
  fontSize: 10,
  lineHeight: 12,
  gap: 0,
  insetX: 0,
  insetBottom: 0,
} as const;

/**
 * Статус-бейджи (аукцион, рассрочка…) — тот же компактный стиль, что overlay на фото.
 * Откат: `PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE = false`.
 */
export const PRODUCT_CARD_STATUS_BADGES_USE_OVERLAY_STYLE = true;

export const PRODUCT_CARD_STATUS_BADGE_OVERLAY_LAYOUT = {
  borderRadius: PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT.borderRadius,
  paddingVertical: PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT.paddingVertical,
  paddingHorizontal: PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT.paddingHorizontal,
  fontSize: PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT.fontSize,
  lineHeight: PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT.lineHeight,
  rowGap: 2,
} as const;

/** Подложка строки бейджей на экране товара. */
export const PRODUCT_CARD_DETAIL_BADGE_ROW_CHROME = {
  paddingHorizontal: 8,
  paddingVertical: 6,
  borderRadius: 10,
} as const;

export const PRODUCT_CARD_MOBILE_LAYOUT = {
  contentInsetX: 8,
  bodyGap: 4,
  metaStripGap: 2.4,
} as const;

/** client designTokens.css + productCardTokens.css */
export const PRODUCT_CARD_BANNER_CHROME = {
  accent: semanticColors.danger,
  accentHover: semanticColors.danger,
  accentSoft: semanticColors.dangerSurface,
  gradientEnd: semanticColors.dangerSurface,
  imageAspectRatio: 1,
  outerRadius: 15,
  contentPaddingX: 12,
  contentPaddingTop: 15,
  contentPaddingBottom: 13,
} as const;

/** Синхронизировано с ProductCardBadges.css / ProductCardMobileCatalog.css */
export const PRODUCT_CARD_BADGE_LAYOUT = {
  borderRadius: 5.6,
  fontSize: 11.5,
  lineHeight: 15.5,
  paddingVertical: 3.2,
  paddingHorizontal: 8,
  paddingHorizontalWide: 8.8,
  paddingVerticalCompact: 2.4,
  paddingHorizontalCompact: 7.2,
  imageInsetX: 12,
  imageInsetBottom: 6.6,
  imageGap: 4.8,
  statusGap: 6,
  sellerBadgeSize: 15,
  sellerNameGap: 4,
} as const;
