/** Паритет с web `MobileBottomNav.css` — inset 0.75rem @ 16px. */
export const MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 12;

/** Паритет с web `--mobile-bottom-nav-float-offset`. */
export const MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 10;

/** Web `.mobile-bottom-nav` item `min-height: 2.5rem`. */
export const MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT = 40;

/** Shell `paddingBottom` floor when safe-area inset is zero. */
export const MOBILE_BOTTOM_NAV_SHELL_MIN_PADDING_BOTTOM = 4;

/** Высота зоны таббара — для `paddingBottom` скролла под floating nav. */
export const resolveMobileBottomNavReservedHeight = (safeAreaBottom = 0): number =>
  MOBILE_BOTTOM_NAV_FLOAT_OFFSET +
  MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT +
  Math.max(safeAreaBottom, MOBILE_BOTTOM_NAV_SHELL_MIN_PADDING_BOTTOM);

export const resolveMobileBottomNavHorizontalInset = (insets: {
  left?: number;
  right?: number;
} = {}): number =>
  Math.max(
    MOBILE_BOTTOM_NAV_HORIZONTAL_INSET,
    insets.left ?? 0,
    insets.right ?? 0,
  );
