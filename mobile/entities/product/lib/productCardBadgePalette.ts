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
  priceCurrent: "#1d4ed8",
  rating: "#b45309",
  ratingPlaceholder: "rgba(17, 24, 39, 0.48)",
} as const;

/** client ProductCardMedia.css — бейджи поверх фото */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY = {
  borderColor: "rgba(17, 24, 39, 0.18)",
  shadowColor: "rgba(0, 0, 0, 0.18)",
  discountBackground: "rgba(254, 226, 226, 0.72)",
  discountText: "rgba(153, 27, 27, 0.88)",
  loyaltyBackground: "rgba(220, 252, 231, 0.72)",
  loyaltyText: "rgba(22, 101, 52, 0.88)",
} as const;

export const PRODUCT_CARD_MOBILE_LAYOUT = {
  contentInsetX: 8,
  imageAspectRatio: 0.685,
  bodyGap: 4,
  metaStripGap: 2.4,
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
  /** 0.35rem — ProductCardMobileCatalog.css */
  imageInsetX: 5.6,
  /** calc(0.35rem + 1px) — ProductCardMobileCatalog.css */
  imageInsetBottom: 6.6,
  imageGap: 4.8,
  statusGap: 6,
  sellerBadgeSize: 15,
  sellerNameGap: 4,
} as const;
