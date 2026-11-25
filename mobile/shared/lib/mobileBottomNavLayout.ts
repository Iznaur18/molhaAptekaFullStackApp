/** Паритет с web `--mobile-bottom-nav-horizontal-inset: 0.75rem`. */
export const MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 12;

/**
 * Зазор над safe-area. Паритет с web `--mobile-bottom-nav-float-offset: 0.125rem`.
 * (Не путать с AppShell content clearance `--app-shell-mobile-bottom-nav-float-offset: 0.625rem`.)
 */
export const MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 2;

/**
 * Blur glass.
 * Web CSS: `blur(18px)` — RN-web BlurView intensity 18 + backdropFilter.
 * Native: intensity 40 — platform-исключение (expo-blur intensity ≠ CSS px;
 * 18 на iOS визуально слабее web 18px).
 */
export const MOBILE_BOTTOM_NAV_BLUR_INTENSITY_WEB = 18;
export const MOBILE_BOTTOM_NAV_BLUR_INTENSITY_NATIVE = 40;
export const MOBILE_BOTTOM_NAV_BLUR_CSS_PX = 18;

/**
 * Мин. расстояние от нижнего края экрана до pill, когда `safeAreaBottom === 0`
 * (типичный Android tablet / gesture nav без inset). Паритет с боковым inset.
 */
export const MOBILE_BOTTOM_NAV_MIN_EDGE_GAP = MOBILE_BOTTOM_NAV_HORIZONTAL_INSET;

/** Вертикальный паддинг pill-контейнера (~0.35rem). */
export const MOBILE_BOTTOM_NAV_PADDING_VERTICAL = 6;

/** Горизонтальный паддинг pill-контейнера (~0.45rem). */
export const MOBILE_BOTTOM_NAV_PADDING_HORIZONTAL = 7;

/** Мин. высота таба. Паритет с web `.mobile-bottom-nav__item` `min-height: 2.9rem`. */
export const MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT = 46.4;

/** Скругление ячейки. Паритет с web `border-radius: 1.1rem`. */
export const MOBILE_BOTTOM_NAV_ITEM_RADIUS = 17.6;

/** Центральный «+». Паритет с web `.mobile-bottom-nav__item--primary` 2.9rem. */
export const MOBILE_BOTTOM_NAV_PRIMARY_SIZE = 46.4;

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
 * iPhone:  2 + max(34, 12) = 36
 * Android: 2 + max(0, 12)  = 14
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
  resolveMobileBottomNavPaddingBottom(safeAreaBottom) +
  resolveMobileBottomNavPillHeight();

/**
 * Inset списка под overlay-nav: высота pill + float/safe-area зона.
 * Дополнительный зазор между последним контентом и pill — в screenContentLayout.
 */
export const resolveMobileBottomNavOverlayContentInset = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavLayoutHeight(safeAreaBottom);

/** @deprecated используйте resolveMobileBottomNavLayoutHeight / OverlayContentInset */
export const resolveMobileBottomNavReservedHeight = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavLayoutHeight(safeAreaBottom);

export const resolveMobileBottomNavHorizontalInset = (
  insets: {
    left?: number;
    right?: number;
  } = {},
): number =>
  Math.max(MOBILE_BOTTOM_NAV_HORIZONTAL_INSET, insets.left ?? 0, insets.right ?? 0);
