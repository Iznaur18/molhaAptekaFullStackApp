import { izLayout } from "@izibuy/design-tokens";

/** ≤359dp — узкие телефоны */
export const SCREEN_NARROW_MAX_WIDTH = 359;

/** ≥600dp — малый планшет / большой телефон */
export const SCREEN_SMALL_TABLET_MIN_WIDTH = izLayout.smallTabletMinWidth;

/** ≥768dp — iPad portrait (768×1024) и аналоги */
export const SCREEN_MEDIUM_TABLET_MIN_WIDTH = izLayout.mediumTabletMinWidth;

/** ≥1024dp — iPad Pro 12.9" (1024×1366) и аналоги */
export const SCREEN_LARGE_TABLET_MIN_WIDTH = izLayout.largeTabletMinWidth;

/** @deprecated используйте SCREEN_SMALL_TABLET_MIN_WIDTH */
export const SCREEN_TABLET_MIN_WIDTH = SCREEN_SMALL_TABLET_MIN_WIDTH;

export const SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET =
  izLayout.contentMaxWidthSmallTablet;
export const SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET =
  izLayout.contentMaxWidthMediumTablet;
export const SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET =
  izLayout.contentMaxWidthLargeTablet;
/** ≥1280: паритет с web `--app-shell-max-width` / `izLayout.contentMaxWidthWide` */
export const SCREEN_CONTENT_MAX_WIDTH_WIDE = izLayout.contentMaxWidthWide;

/** @deprecated используйте SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET */
export const SCREEN_CONTENT_MAX_WIDTH_TABLET = SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET;

export const PROFILE_CONTENT_MAX_WIDTH_PHONE = 420;
export const PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET = 560;
export const PROFILE_CONTENT_MAX_WIDTH_MEDIUM_TABLET = 640;
export const PROFILE_CONTENT_MAX_WIDTH_LARGE_TABLET = 720;

/** @deprecated используйте PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET */
export const PROFILE_CONTENT_MAX_WIDTH_TABLET = PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET;

export const PRODUCT_GRID_GAP = 8;

/**
 * `--app-shell-content-inline-padding`.
 * ≤640: 0.5rem. 641–667: 0.75rem (`@media max-width 667`). Шире: `--iz-space-4` 1rem.
 */
export const SCREEN_CONTENT_INLINE_PADDING_PHONE_MAX_WIDTH =
  izLayout.contentInlinePaddingPhoneMaxWidth;
export const SCREEN_CONTENT_INLINE_PADDING_COMPACT_MAX_WIDTH =
  izLayout.contentInlinePaddingCompactMaxWidth;
export const SCREEN_CONTENT_INLINE_PADDING_PHONE =
  izLayout.contentPaddingHorizontalPhone;
export const SCREEN_CONTENT_INLINE_PADDING_COMPACT =
  izLayout.contentPaddingHorizontalCompact;
export const SCREEN_CONTENT_INLINE_PADDING_WIDE =
  izLayout.contentPaddingHorizontalWide;

export const resolveScreenContentInlinePadding = (width: number): number => {
  if (width <= SCREEN_CONTENT_INLINE_PADDING_PHONE_MAX_WIDTH) {
    return SCREEN_CONTENT_INLINE_PADDING_PHONE;
  }
  if (width <= SCREEN_CONTENT_INLINE_PADDING_COMPACT_MAX_WIDTH) {
    return SCREEN_CONTENT_INLINE_PADDING_COMPACT;
  }
  return SCREEN_CONTENT_INLINE_PADDING_WIDE;
};

/** ≤667px — 2 колонки как web mobile */
export const SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH = 667;

/** ≤903px — 3 колонки как web mobile */
export const SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH = 903;

/** ≥1280dp — 4 колонки на главной ленте товаров */
export const SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH = izLayout.wideMinWidth;

export const PRODUCT_GRID_COLUMNS_COMPACT = 2;
export const PRODUCT_GRID_COLUMNS_MEDIUM = 3;
export const PRODUCT_GRID_COLUMNS_WIDE = 4;

/** @deprecated используйте PRODUCT_GRID_COLUMNS_COMPACT */
export const PRODUCT_GRID_COLUMNS_NARROW = PRODUCT_GRID_COLUMNS_COMPACT;

/** @deprecated используйте PRODUCT_GRID_COLUMNS_MEDIUM */
export const PRODUCT_GRID_COLUMNS_DEFAULT = PRODUCT_GRID_COLUMNS_MEDIUM;

/** @deprecated используйте PRODUCT_GRID_COLUMNS_WIDE */
export const PRODUCT_GRID_COLUMNS_TABLET = PRODUCT_GRID_COLUMNS_WIDE;

/** @deprecated */
export const PRODUCT_GRID_COLUMNS_SMALL_TABLET = PRODUCT_GRID_COLUMNS_WIDE;

/** @deprecated */
export const PRODUCT_GRID_COLUMNS_SMALL_TABLET_LANDSCAPE = PRODUCT_GRID_COLUMNS_WIDE;

/** @deprecated */
export const PRODUCT_GRID_COLUMNS_MEDIUM_TABLET = PRODUCT_GRID_COLUMNS_MEDIUM;

/** @deprecated */
export const PRODUCT_GRID_COLUMNS_MEDIUM_TABLET_LANDSCAPE = PRODUCT_GRID_COLUMNS_MEDIUM;

/** @deprecated */
export const PRODUCT_GRID_COLUMNS_LARGE_TABLET = PRODUCT_GRID_COLUMNS_MEDIUM;

/** @deprecated */
export const PRODUCT_GRID_COLUMNS_LARGE_TABLET_LANDSCAPE = PRODUCT_GRID_COLUMNS_WIDE;

export type ScreenSizeInput = {
  width: number;
  height: number;
};

export type ScreenWidthTier =
  | "phone-narrow"
  | "phone"
  | "tablet-small"
  | "tablet-medium"
  | "tablet-large";

export const resolveIsNarrowScreen = (width: number): boolean =>
  width <= SCREEN_NARROW_MAX_WIDTH;

export const resolveIsSmallTabletScreen = (width: number): boolean =>
  width >= SCREEN_SMALL_TABLET_MIN_WIDTH && width < SCREEN_MEDIUM_TABLET_MIN_WIDTH;

export const resolveIsMediumTabletScreen = (width: number): boolean =>
  width >= SCREEN_MEDIUM_TABLET_MIN_WIDTH && width < SCREEN_LARGE_TABLET_MIN_WIDTH;

export const resolveIsLargeTabletScreen = (width: number): boolean =>
  width >= SCREEN_LARGE_TABLET_MIN_WIDTH;

export const resolveIsTabletScreen = (width: number): boolean =>
  width >= SCREEN_SMALL_TABLET_MIN_WIDTH;

export const resolveScreenWidthTier = (width: number): ScreenWidthTier => {
  if (width <= SCREEN_NARROW_MAX_WIDTH) {
    return "phone-narrow";
  }
  if (width < SCREEN_SMALL_TABLET_MIN_WIDTH) {
    return "phone";
  }
  if (width < SCREEN_MEDIUM_TABLET_MIN_WIDTH) {
    return "tablet-small";
  }
  if (width < SCREEN_LARGE_TABLET_MIN_WIDTH) {
    return "tablet-medium";
  }
  return "tablet-large";
};

export const resolveContentMaxWidth = (width: number): number | undefined => {
  if (width >= SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH) {
    return SCREEN_CONTENT_MAX_WIDTH_WIDE;
  }
  const tier = resolveScreenWidthTier(width);
  if (tier === "tablet-large") {
    return SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET;
  }
  if (tier === "tablet-medium") {
    return SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET;
  }
  if (tier === "tablet-small") {
    return SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET;
  }
  return undefined;
};

/** Ширина контента для расчёта сеток внутри centered-обёртки */
export const resolveLayoutContentWidth = (width: number): number => {
  const maxWidth = resolveContentMaxWidth(width);
  return maxWidth != null ? Math.min(width, maxWidth) : width;
};

export const resolveProfileContentMaxWidth = (width: number): number => {
  const tier = resolveScreenWidthTier(width);
  switch (tier) {
    case "tablet-large":
      return PROFILE_CONTENT_MAX_WIDTH_LARGE_TABLET;
    case "tablet-medium":
      return PROFILE_CONTENT_MAX_WIDTH_MEDIUM_TABLET;
    case "tablet-small":
      return PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET;
    default:
      return PROFILE_CONTENT_MAX_WIDTH_PHONE;
  }
};

export const resolveProductGridColumns = ({ width }: ScreenSizeInput): number => {
  if (width <= SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH) {
    return PRODUCT_GRID_COLUMNS_COMPACT;
  }
  if (width <= SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH) {
    return PRODUCT_GRID_COLUMNS_MEDIUM;
  }
  if (width < SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH) {
    return PRODUCT_GRID_COLUMNS_MEDIUM;
  }
  return PRODUCT_GRID_COLUMNS_WIDE;
};

/** Паритет с AppShell.css: 0.1rem / 0.15rem / 1rem */
export const resolveProductGridGap = (width: number): number => {
  if (width <= SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH) {
    return 2;
  }
  if (width <= SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH) {
    return 2.4;
  }
  return 16;
};
