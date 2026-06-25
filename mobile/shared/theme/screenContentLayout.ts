import { resolveMobileBottomNavReservedHeight } from "@/shared/lib/mobileBottomNavLayout";

/** Базовый горизонтальный inset контента — паритет с web `app-shell` mobile (1rem). */
export const SCREEN_CONTENT_PADDING_HORIZONTAL = 16;

/** Отступ между секциями на главной / в каталоге. */
export const SCREEN_CONTENT_SECTION_GAP = 8;

/** Низ списка: floating tab bar + небольшой зазор. */
export const SCREEN_CONTENT_TAB_BAR_EXTRA_GAP = 8;

/** @deprecated Prefer resolveScreenContentPaddingBottom(safeAreaBottom). */
export const SCREEN_CONTENT_PADDING_BOTTOM = 18;

export const resolveScreenContentPaddingBottom = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavReservedHeight(safeAreaBottom) + SCREEN_CONTENT_TAB_BAR_EXTRA_GAP;

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
