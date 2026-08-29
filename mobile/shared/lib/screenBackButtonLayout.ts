/** Keep in sync with `AUTH_PAGE_LAYOUT` + web `.auth-page__back`. */
export const SCREEN_BACK_BUTTON_SIZE = 40;
export const SCREEN_BACK_BUTTON_TOP_INSET = 8;
export const SCREEN_BACK_BUTTON_LEFT_INSET = 16;
export const SCREEN_BACK_BUTTON_RADIUS = 10;
export const SCREEN_BACK_BUTTON_GAP_BELOW = 8;

/** @deprecated use SCREEN_BACK_BUTTON_TOP_INSET */
export const SCREEN_BACK_BUTTON_EDGE = SCREEN_BACK_BUTTON_TOP_INSET;

export function resolveScreenBackContentPaddingTop(safeAreaTop: number): number {
  return (
    safeAreaTop +
    SCREEN_BACK_BUTTON_TOP_INSET +
    SCREEN_BACK_BUTTON_SIZE +
    SCREEN_BACK_BUTTON_GAP_BELOW
  );
}
