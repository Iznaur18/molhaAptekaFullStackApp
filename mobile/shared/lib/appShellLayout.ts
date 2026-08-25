import type { ViewStyle } from "react-native";

import { resolveViewportLayoutWidth } from "@/shared/lib/resolveViewportLayoutWidth";
import {
  resolveContentMaxWidth,
  resolveLayoutContentWidth,
} from "@/shared/lib/screenBreakpoints";
import {
  resolveScreenContentPaddingHorizontal,
  SCREEN_CONTENT_PADDING_HORIZONTAL,
} from "@/shared/theme/screenContentLayout";

type ScreenSafeAreaInsets = {
  left?: number;
  right?: number;
};

/**
 * Внешний контейнер как web `.app-shell`:
 * max-width по брейкпоинтам + центрирование. Padding — отдельно внутри.
 */
export const resolveAppShellMaxWidthStyle = (windowWidth: number): ViewStyle => {
  const viewportWidth = resolveViewportLayoutWidth(windowWidth);
  const maxWidth = resolveContentMaxWidth(viewportWidth);

  if (maxWidth == null) {
    return { width: "100%", alignSelf: "stretch" };
  }

  return {
    width: "100%",
    maxWidth,
    alignSelf: "center",
  };
};

/** Ширина контентной колонки (с учётом scrollbar на web). */
export const resolveAppShellLayoutWidth = (windowWidth: number): number =>
  resolveLayoutContentWidth(resolveViewportLayoutWidth(windowWidth));

/**
 * Inline padding как web `--app-shell-content-inline-padding` (1rem + safe-area).
 */
export const resolveAppShellContentPaddingHorizontal = (
  insets: ScreenSafeAreaInsets = {},
): number => resolveScreenContentPaddingHorizontal(insets);

export { SCREEN_CONTENT_PADDING_HORIZONTAL as APP_SHELL_CONTENT_PADDING_HORIZONTAL };
