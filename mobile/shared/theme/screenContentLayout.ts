import { izLayout } from "@izibuy/design-tokens";

import { resolveMobileBottomNavOverlayContentInset } from "@/shared/lib/mobileBottomNavLayout";
import {
  resolveIsTabletScreen,
  resolveScreenContentInlinePadding,
} from "@/shared/lib/screenBreakpoints";

/**
 * Базовый горизонтальный inset контента (phone).
 * Канон: `izLayout.contentPaddingHorizontalPhone` = web AppShell phone gutter 0.5rem.
 */
export const SCREEN_CONTENT_PADDING_HORIZONTAL = izLayout.contentPaddingHorizontalPhone;

/** Отступ между секциями на главной / в каталоге (`izLayout.contentSectionGap` / `--iz-space-2`). */
export const SCREEN_CONTENT_SECTION_GAP = izLayout.contentSectionGap;

/** Зазор между последним контентом и floating pill (паритет с web +1rem). */
export const SCREEN_CONTENT_TAB_BAR_EXTRA_GAP = izLayout.tabBarExtraGap;

/** @deprecated Prefer resolveScreenContentPaddingBottom(safeAreaBottom). */
export const SCREEN_CONTENT_PADDING_BOTTOM = 18;

/** Зазор под кнопками «Отмена / Далее» в визардах (поверх safe-area). */
export const WIZARD_FOOTER_BOTTOM_GAP_PHONE = 12;
export const WIZARD_FOOTER_BOTTOM_GAP_TABLET = 32;

/**
 * Bottom inset списков под floating nav.
 *
 * Mobile: `pill+float/safe` + `tabBarExtraGap` (16 = +1rem).
 * Web AppShell padding-bottom:
 *   `3.6rem` nav height + `0.625rem` clearance float + safe-area + `block-padding-y` (1.5rem).
 * Nav position float на web = 0.125rem (как MOBILE_BOTTOM_NAV_FLOAT_OFFSET);
 * clearance 0.625rem + block-y 1.5rem ≈ воздух под контентом — у нас сжато в +16.
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
  width?: number,
): number =>
  Math.max(
    width == null
      ? SCREEN_CONTENT_PADDING_HORIZONTAL
      : resolveScreenContentInlinePadding(width),
    insets.left ?? 0,
    insets.right ?? 0,
  );
