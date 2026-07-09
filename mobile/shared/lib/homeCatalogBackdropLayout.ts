/** Periwinkle backdrop — паритет с референсом overlapping scroll. */
export const HOME_CATALOG_PRIMARY_BACKDROP_COLOR = "#6E7FD9";

/** Доля высоты экрана, занятая фиолетовой hero-шапкой в покое. */
export const HOME_CATALOG_BACKDROP_REST_VISIBLE_RATIO = 0.85;

/** Скругление верхней кромки foreground-sheet. */
export const HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS = 36;

/** Высота cap-полоски со скруглением над поиском. */
export const HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT = 36;

/** Высота фиолетовой hero-шапки в потоке ленты. */
export const resolveHomeCatalogPrimaryBackdropHeight = (windowHeight: number): number =>
  Math.round(windowHeight * HOME_CATALOG_BACKDROP_REST_VISIBLE_RATIO);
