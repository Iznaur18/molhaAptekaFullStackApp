/** Синхронизировано с client product-card/ProductCardBadges.css + ProductPriceDisplay.css */
export const PRODUCT_CARD_BADGE_COLORS = {
  discountBorder: "#fecaca",
  discountBg: "#fee2e2",
  discountText: "#991b1b",
  loyaltyBorder: "rgba(22, 163, 74, 0.45)",
  loyaltyBg: "#dcfce7",
  loyaltyText: "#166534",
  hiddenBg: "#fef3c7",
  hiddenText: "#92400e",
  promotionBoostBorder: "rgba(217, 119, 6, 0.45)",
  promotionBoostBg: "#fef3c7",
  promotionBoostText: "#92400e",
  promotionTopBorder: "rgba(124, 58, 237, 0.45)",
  promotionTopBg: "#ede9fe",
  promotionTopText: "#5b21b6",
  promotionBannerBorder: "rgba(220, 38, 38, 0.45)",
  promotionBannerBg: "#fecaca",
  promotionBannerText: "#991b1b",
  auctionBorder: "rgba(14, 165, 233, 0.4)",
  auctionBg: "#e0f2fe",
  auctionText: "#0369a1",
  installmentBorder: "rgba(5, 150, 105, 0.4)",
  installmentBg: "#ecfdf5",
  installmentText: "#047857",
  raffleBorder: "rgba(167, 139, 250, 0.4)",
  raffleBg: "#ede9fe",
  raffleText: "#5b21b6",
  statusPlaceholderBorder: "#e2e8f0",
  statusPlaceholderBg: "#f1f5f9",
  statusPlaceholderText: "rgba(17, 24, 39, 0.48)",
  priceCurrent: "#1d4ed8",
  rating: "#b45309",
  ratingPlaceholder: "rgba(17, 24, 39, 0.48)",
} as const;

/** Ozon-стиль: непрозрачные пастельные плашки с ярким жирным текстом поверх фото. */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY = {
  borderColor: "transparent",
  shadowColor: "transparent",
  /** Светло-розовая плашка скидки, ярко-малиновый текст. */
  discountBackground: "#fbdcea",
  discountText: "#f1117e",
  /** Светло-лавандовая плашка баллов, фиолетовый текст. */
  loyaltyBackground: "#f0e4fa",
  loyaltyText: "#8e24aa",
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
  accent: "#dc2626",
  accentHover: "#b91c1c",
  accentSoft: "#fecaca",
  gradientEnd: "#fef2f2",
  imageAspectRatio: 1.35,
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
  /** 0.75rem — mobile catalog image badge inset */
  imageInsetX: 12,
  /** calc(0.35rem + 1px) — ProductCardMobileCatalog.css */
  imageInsetBottom: 6.6,
  imageGap: 4.8,
  statusGap: 6,
  sellerBadgeSize: 15,
  sellerNameGap: 4,
} as const;
