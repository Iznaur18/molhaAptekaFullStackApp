/** Чёрный fallback под intro-видео и overscroll bleed. */
export const HOME_CATALOG_PRIMARY_BACKDROP_COLOR = "#000000";

/** Доля высоты экрана, занятая hero-шапкой в покое. */
export const HOME_CATALOG_BACKDROP_REST_VISIBLE_RATIO = 0.85;

/** Скругление верхней кромки foreground-sheet. */
export const HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS = 36;

/** Высота cap-полоски со скруглением над поиском. */
export const HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT = 36;

/** Высота hero-шапки в потоке ленты (без cap-overlap). */
export const resolveHomeCatalogPrimaryBackdropHeight = (windowHeight: number): number =>
  Math.round(windowHeight * HOME_CATALOG_BACKDROP_REST_VISIBLE_RATIO);

/** Hero + запас под cap: видео заходит под скруглённую кромку листа. */
export const resolveHomeCatalogIntroBackdropHeight = (windowHeight: number): number =>
  resolveHomeCatalogPrimaryBackdropHeight(windowHeight) +
  HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT;
