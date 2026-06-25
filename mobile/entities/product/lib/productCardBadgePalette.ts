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

/** client ProductCardMedia.css — бейджи поверх фото */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY = {
  borderColor: "rgba(17, 24, 39, 0.18)",
  shadowColor: "rgba(0, 0, 0, 0.18)",
  discountBackground: "rgba(254, 226, 226, 0.72)",
  discountText: "rgba(153, 27, 27, 0.88)",
  loyaltyBackground: "rgba(220, 252, 231, 0.72)",
  loyaltyText: "rgba(22, 101, 52, 0.88)",
} as const;

/** ProductPriceDisplay.css + ProductCardMedia.css (0.72rem / 0.35rem) */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT = {
  borderRadius: 5.6,
  paddingVertical: 3.2,
  paddingHorizontal: 8,
  fontSize: 11.52,
  lineHeight: 15.47,
  gap: 4.8,
  insetX: 12,
  insetBottom: 6.6,
} as const;

export const PRODUCT_CARD_MOBILE_LAYOUT = {
  contentInsetX: 8,
  imageAspectRatio: 0.685,
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

/** client ProductCardMedia.css `.product-card__image-nav-btn` */
export const PRODUCT_CARD_IMAGE_NAV_CHROME = {
  size: 28,
  rowPaddingHorizontal: 2.4,
  fontSize: 16,
  lineHeight: 16,
  borderWidth: 1,
  backgroundSurfaceOpacity: 0.42,
  buttonOpacity: 0.88,
  blurRadius: 4,
} as const;

const mixHexWithAlpha = (hexColor: string, opacity: number): string => {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) {
    return `rgba(255, 255, 255, ${opacity})`;
  }

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const resolveProductCardImageNavBackground = (surfaceColor: string): string =>
  mixHexWithAlpha(surfaceColor, PRODUCT_CARD_IMAGE_NAV_CHROME.backgroundSurfaceOpacity);

export const resolveProductCardImageNavBorderColor = (textColor: string): string =>
  mixHexWithAlpha(textColor, 0.14);
