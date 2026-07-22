/** Паритет с web `--mobile-bottom-nav-horizontal-inset: 0.75rem`. */
export const MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 12;

/**
 * Зазор над safe-area (или над min-edge, если safe-area = 0).
 * На iPhone home-indicator уже даёт большой inset — float держим умеренным.
 */
export const MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 6;

/**
 * Мин. расстояние от нижнего края экрана до pill, когда `safeAreaBottom === 0`
 * (типичный Android tablet / gesture nav без inset). Паритет с боковым inset.
 */
export const MOBILE_BOTTOM_NAV_MIN_EDGE_GAP = MOBILE_BOTTOM_NAV_HORIZONTAL_INSET;

/** Вертикальный паддинг pill-контейнера (~0.35rem). */
export const MOBILE_BOTTOM_NAV_PADDING_VERTICAL = 6;

/** Горизонтальный паддинг pill-контейнера (~0.45rem). */
export const MOBILE_BOTTOM_NAV_PADDING_HORIZONTAL = 7;

/** Мин. высота таба (~2.5rem web). */
export const MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT = 40;

/** Скругление pill — паритет с `--iz-radius-pill`. */
export const MOBILE_BOTTOM_NAV_BORDER_RADIUS = 999;

/** Высота только pill (без float / safe-area). */
export const resolveMobileBottomNavPillHeight = (): number =>
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL +
  MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT +
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL;

/**
 * Единая формула зазора от нижнего края устройства до pill:
 *   FLOAT_OFFSET + max(safeAreaBottom, MIN_EDGE_GAP)
 *
 * iPhone:  6 + max(34, 12) = 40
 * Android: 6 + max(0, 12)  = 18  (не прилипает к краю)
 */
export const resolveMobileBottomNavPaddingBottom = (safeAreaBottom = 0): number =>
  MOBILE_BOTTOM_NAV_FLOAT_OFFSET +
  Math.max(safeAreaBottom, MOBILE_BOTTOM_NAV_MIN_EDGE_GAP);

/**
 * Высота зоны таббара под контент:
 * paddingBottom + pill.
 * Для hide-анимации и absolute footer над баром.
 */
export const resolveMobileBottomNavLayoutHeight = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavPaddingBottom(safeAreaBottom) + resolveMobileBottomNavPillHeight();

/**
 * Inset списка под overlay-nav: высота pill + float/safe-area зона.
 * Дополнительный зазор между последним контентом и pill — в screenContentLayout.
 */
export const resolveMobileBottomNavOverlayContentInset = (
  safeAreaBottom = 0,
): number => resolveMobileBottomNavLayoutHeight(safeAreaBottom);

/** @deprecated используйте resolveMobileBottomNavLayoutHeight / OverlayContentInset */
export const resolveMobileBottomNavReservedHeight = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavLayoutHeight(safeAreaBottom);

export const resolveMobileBottomNavHorizontalInset = (insets: {
  left?: number;
  right?: number;
} = {}): number =>
  Math.max(
    MOBILE_BOTTOM_NAV_HORIZONTAL_INSET,
    insets.left ?? 0,
    insets.right ?? 0,
  );
