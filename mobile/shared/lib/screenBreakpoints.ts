/** ≤359dp — узкие телефоны */
export const SCREEN_NARROW_MAX_WIDTH = 359;

/** ≥600dp — малый планшет / большой телефон */
export const SCREEN_SMALL_TABLET_MIN_WIDTH = 600;

/** ≥768dp — iPad portrait (768×1024) и аналоги */
export const SCREEN_MEDIUM_TABLET_MIN_WIDTH = 768;

/** ≥1024dp — iPad Pro 12.9" (1024×1366) и аналоги */
export const SCREEN_LARGE_TABLET_MIN_WIDTH = 1024;

/** @deprecated используйте SCREEN_SMALL_TABLET_MIN_WIDTH */
export const SCREEN_TABLET_MIN_WIDTH = SCREEN_SMALL_TABLET_MIN_WIDTH;

export const SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET = 520;
export const SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET = 720;
export const SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET = 960;

/** @deprecated используйте SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET */
export const SCREEN_CONTENT_MAX_WIDTH_TABLET = SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET;

export const PROFILE_CONTENT_MAX_WIDTH_PHONE = 420;
export const PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET = 560;
export const PROFILE_CONTENT_MAX_WIDTH_MEDIUM_TABLET = 640;
export const PROFILE_CONTENT_MAX_WIDTH_LARGE_TABLET = 720;

/** @deprecated используйте PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET */
export const PROFILE_CONTENT_MAX_WIDTH_TABLET = PROFILE_CONTENT_MAX_WIDTH_SMALL_TABLET;

export const PRODUCT_GRID_GAP = 8;

/** ≤667px — 2 колонки как web mobile */
export const SCREEN_PRODUCT_GRID_2_COL_MAX_WIDTH = 667;

/** ≤903px — 3 колонки как web mobile */
export const SCREEN_PRODUCT_GRID_3_COL_MAX_WIDTH = 903;

/** ≥1280dp — 4 колонки на главной ленте товаров */
export const SCREEN_PRODUCT_GRID_4_COL_MIN_WIDTH = 1280;

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
