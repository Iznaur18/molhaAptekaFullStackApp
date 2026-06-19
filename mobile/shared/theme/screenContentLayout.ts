/** Базовый горизонтальный inset контента от краёв экрана. */
export const SCREEN_CONTENT_PADDING_HORIZONTAL = 14;

/** Отступ между секциями на главной / в каталоге. */
export const SCREEN_CONTENT_SECTION_GAP = 8;

/** Низ списка над таббаром. */
export const SCREEN_CONTENT_PADDING_BOTTOM = 18;

type ScreenSafeAreaInsets = {
  left?: number;
  right?: number;
};

/** Горизонтальный inset с учётом safe area (вырезы, landscape). */
export const resolveScreenContentPaddingHorizontal = (
  insets: ScreenSafeAreaInsets = {},
): number =>
  Math.max(
    SCREEN_CONTENT_PADDING_HORIZONTAL,
    insets.left ?? 0,
    insets.right ?? 0,
  );
