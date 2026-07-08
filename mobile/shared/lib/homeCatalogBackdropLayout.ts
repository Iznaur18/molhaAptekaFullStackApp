/** Periwinkle backdrop — паритет с референсом overlapping scroll. */
export const HOME_CATALOG_PRIMARY_BACKDROP_COLOR = "#6E7FD9";

/** Видимая цветная зона под status bar (без overlap-trick). */
export const HOME_CATALOG_PRIMARY_BACKDROP_VISIBLE_BODY_HEIGHT = 140;

/** Целевой paddingTop контента — ~180 на типичном экране (safeArea + body). */
export const HOME_CATALOG_PRIMARY_BACKDROP_PEEK_HEIGHT = 180;

/** Скругление верхней кромки белого foreground-sheet. */
export const HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS = 36;

/** Высота cap-полоски со скруглением над поиском. */
export const HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT = 36;

export const resolveHomeCatalogPrimaryBackdropHeight = (safeAreaTop: number): number =>
  safeAreaTop + HOME_CATALOG_PRIMARY_BACKDROP_VISIBLE_BODY_HEIGHT;

/** Верхний прозрачный inset ScrollView/FlatList — высота видимой шапки. */
export const resolveHomeCatalogPrimaryBackdropPeekHeight = (safeAreaTop: number): number =>
  Math.max(
    HOME_CATALOG_PRIMARY_BACKDROP_PEEK_HEIGHT,
    resolveHomeCatalogPrimaryBackdropHeight(safeAreaTop),
  );

/** paddingTop FlatList: видимая фиолетовая зона без safe-area (safe-area — в sticky search). */
export const resolveHomeCatalogBackdropScrollPaddingTop = (safeAreaTop: number): number =>
  resolveHomeCatalogPrimaryBackdropPeekHeight(safeAreaTop) - safeAreaTop;
