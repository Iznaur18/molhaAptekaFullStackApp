import { izColors, type IzTheme } from "@izibuy/design-tokens";

import { PRODUCT_CARD_MOBILE_CATALOG_LAYOUT } from "@/entities/product/lib/productCardMobileCatalogLayout";
import { mixHexColors } from "@/shared/lib/mixHexColors";

type ThemeColors = IzTheme["colors"];

/** client ProductPriceDisplay.css — color-mix(in srgb, currentColor 52%, transparent) на surface карточки */
export const resolveProductPriceDisplayOldColor = (c: ThemeColors) =>
  mixHexColors(c.text, c.surface, 0.52);

/** Синхронизировано с client ProductPriceDisplay.css + ProductCardMobileCatalog.css */
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
    wholesaleBorder: `${c.action}66`,
    wholesaleBg: `${c.action}14`,
    wholesaleText: c.action,
    /** Розыгрыш — розовая палитра (не warning/жёлтый). */
    raffleBorder: "#f9a8d466",
    raffleBg: "#fdf2f8",
    raffleText: "#be185d",
    statusPlaceholderBorder: c.border,
    statusPlaceholderBg: c.surfaceMuted,
    statusPlaceholderText: `${c.text}7a`,
    priceCurrent: c.action,
    priceOld: resolveProductPriceDisplayOldColor(c),
    rating: c.textMuted,
    ratingPlaceholder: mixHexColors(c.textMuted, c.surface, 0.48),
  }) as const;

/**
 * Горящая скидка. В light веб хардкодит тёплый оранжевый
 * (.product-card__flash-sale-badge), в dark — переключается на warning-токены
 * (:root[data-theme="dark"] в ProductCardBadges.css). Повторяем обе ветки.
 */
export const resolveProductCardFlashSaleBadgeColors = (
  c: ThemeColors,
  isDark: boolean,
): { borderColor: string; backgroundColor: string; textColor: string } =>
  isDark
    ? {
        borderColor: `${c.warning}66`,
        backgroundColor: c.warningSurface,
        textColor: c.warningText,
      }
    : {
        borderColor: "#fdba7466",
        backgroundColor: "#fff3e8",
        textColor: "#c2410c",
      };

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

/**
 * Компенсация image bleed (`marginHorizontal: -contentInsetX`): overlay с left:0
 * обрезается `overflow:hidden` карточки. Web mobile catalog ставит bleed-x: 0.
 */
export const resolveProductCardImageOverlayInsetX = (
  layout: "default" | "catalog-grid" = "default",
): number =>
  layout === "catalog-grid"
    ? PRODUCT_CARD_MOBILE_CATALOG_LAYOUT.contentInsetX
    : PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX;

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

/** Бейджи в блоке цены на экране товара — крупнее overlay на карточке. */
export const PRODUCT_CARD_DETAIL_BADGE_LAYOUT = {
  borderRadius: 6,
  paddingVertical: 3.5,
  paddingHorizontal: 9,
  fontSize: 10.4,
  lineHeight: 12.5,
  rowGap: 4.5,
} as const;

/** Подложка строки бейджей на экране товара. */
export const PRODUCT_CARD_DETAIL_BADGE_ROW_CHROME = {
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 12,
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
    accentSoft: c.surface,
    gradientEnd: c.surface,
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
