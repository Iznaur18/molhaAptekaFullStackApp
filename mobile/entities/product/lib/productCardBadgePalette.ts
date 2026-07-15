import { izColors, type IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Card price keeps light brand blue in all themes (dark remaps `action`/`link`). */
const PRODUCT_CARD_PRICE_CURRENT = izColors.action;
const PRODUCT_CARD_PRICE_OLD = "#93c5fd";

/** Синхронизировано с client product-card/ProductCardBadges.css + ProductPriceDisplay.css */
export const resolveProductCardBadgeColors = (c: ThemeColors) =>
  ({
    discountBorder: c.dangerSurface,
    discountBg: c.dangerSurface,
    discountText: c.dangerText,
    loyaltyBorder: `${c.success}73`,
    loyaltyBg: c.successSurface,
    loyaltyText: c.successText,
    hiddenBg: c.warningSurface,
    hiddenText: c.warningText,
    promotionBoostBorder: `${c.warning}73`,
    promotionBoostBg: c.warningSurface,
    promotionBoostText: c.warningText,
    promotionTopBorder: `${c.accent}73`,
    promotionTopBg: c.accentSoft,
    promotionTopText: c.accent,
    promotionBannerBorder: `${c.danger}73`,
    promotionBannerBg: c.dangerSurface,
    promotionBannerText: c.dangerText,
    auctionBorder: `${c.info}66`,
    auctionBg: c.infoSoft,
    auctionText: c.info,
    installmentBorder: `${c.success}66`,
    installmentBg: c.successSurface,
    installmentText: c.successText,
    raffleBorder: `${c.accent}66`,
    raffleBg: c.accentSoft,
    raffleText: c.accent,
    statusPlaceholderBorder: c.border,
    statusPlaceholderBg: c.surfaceMuted,
    statusPlaceholderText: `${c.text}7a`,
    priceCurrent: PRODUCT_CARD_PRICE_CURRENT,
    priceOld: PRODUCT_CARD_PRICE_OLD,
    rating: c.warning,
    ratingPlaceholder: `${c.text}7a`,
  }) as const;

/** Ozon-стиль: непрозрачные пастельные плашки с ярким жирным текстом поверх фото. */
export const resolveProductCardImageBadgeOverlay = (c: ThemeColors) =>
  ({
    borderColor: "transparent",
    shadowColor: "transparent",
    discountBackground: c.dangerSurface,
    discountText: c.danger,
    loyaltyBackground: c.accentSoft,
    loyaltyText: c.accent,
  }) as const;

/** @deprecated light snapshot — prefer resolve* + theme */
export const PRODUCT_CARD_BADGE_COLORS = resolveProductCardBadgeColors(izColors);

/** @deprecated light snapshot — prefer resolve* + theme */
export const PRODUCT_CARD_IMAGE_BADGE_OVERLAY = resolveProductCardImageBadgeOverlay(izColors);

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
export const resolveProductCardBannerChrome = (c: ThemeColors) =>
  ({
    accent: c.danger,
    accentHover: c.danger,
    accentSoft: c.dangerSurface,
    gradientEnd: c.dangerSurface,
    imageAspectRatio: 1,
    outerRadius: 15,
    contentPaddingX: 12,
    contentPaddingTop: 15,
    contentPaddingBottom: 13,
  }) as const;

/** @deprecated light snapshot — prefer resolveProductCardBannerChrome */
export const PRODUCT_CARD_BANNER_CHROME = resolveProductCardBannerChrome(izColors);

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
