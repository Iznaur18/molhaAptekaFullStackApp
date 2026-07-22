import {
  resolveMobileBottomNavOverlayContentInset,
} from "@/shared/lib/mobileBottomNavLayout";
import { resolveIsTabletScreen } from "@/shared/lib/screenBreakpoints";

/** Базовый горизонтальный inset контента — паритет с web `app-shell` mobile (1rem). */
export const SCREEN_CONTENT_PADDING_HORIZONTAL = 16;

/** Отступ между секциями на главной / в каталоге. */
export const SCREEN_CONTENT_SECTION_GAP = 8;

/** Зазор между последним контентом и floating pill (паритет с web +1rem). */
export const SCREEN_CONTENT_TAB_BAR_EXTRA_GAP = 16;

/** @deprecated Prefer resolveScreenContentPaddingBottom(safeAreaBottom). */
export const SCREEN_CONTENT_PADDING_BOTTOM = 18;

/** Зазор под кнопками «Отмена / Далее» в визардах (поверх safe-area). */
export const WIZARD_FOOTER_BOTTOM_GAP_PHONE = 12;
export const WIZARD_FOOTER_BOTTOM_GAP_TABLET = 32;

/**
 * Bottom inset списков под floating nav.
 * Резервирует высоту pill + float/safe-area и дополнительный зазор.
 */
export const resolveScreenContentPaddingBottom = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavOverlayContentInset(safeAreaBottom) +
  SCREEN_CONTENT_TAB_BAR_EXTRA_GAP;

export const resolveWizardFooterPaddingBottom = (
  safeAreaBottom: number,
  screenWidth: number,
): number => {
  const gap = resolveIsTabletScreen(screenWidth)
    ? WIZARD_FOOTER_BOTTOM_GAP_TABLET
    : WIZARD_FOOTER_BOTTOM_GAP_PHONE;
  return safeAreaBottom + gap;
};

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
