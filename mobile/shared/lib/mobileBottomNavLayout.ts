/** Паритет с web `MobileBottomNav.css` — inset 0.75rem @ 16px. */
export const MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 12;

/** Паритет с web `--mobile-bottom-nav-float-offset`. */
export const MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 10;

export const resolveMobileBottomNavHorizontalInset = (insets: {
  left?: number;
  right?: number;
} = {}): number =>
  Math.max(
    MOBILE_BOTTOM_NAV_HORIZONTAL_INSET,
    insets.left ?? 0,
    insets.right ?? 0,
  );
