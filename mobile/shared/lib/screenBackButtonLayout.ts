export const SCREEN_BACK_BUTTON_SIZE = 40;
export const SCREEN_BACK_BUTTON_EDGE = 10;
export const SCREEN_BACK_BUTTON_GAP_BELOW = 8;

export function resolveScreenBackContentPaddingTop(safeAreaTop: number): number {
  return (
    safeAreaTop +
    SCREEN_BACK_BUTTON_EDGE +
    SCREEN_BACK_BUTTON_SIZE +
    SCREEN_BACK_BUTTON_GAP_BELOW
  );
}
