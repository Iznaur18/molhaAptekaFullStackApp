import {
  resolveIzTheme,
  resolvePageBackground,
  type ColorScheme,
} from "@izibuy/design-tokens";
import { useContext } from "react";

import { AppThemeContext } from "@/shared/theme/AppThemeProvider";
import { resolveThemePreferenceFromSystem } from "@/shared/theme/themePreferenceStorage";

const resolveFallbackColorScheme = (): ColorScheme => {
  const preference = resolveThemePreferenceFromSystem();
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return "custom";
};

/**
 * Canvas экрана (= web `--iz-page-bg` / `--iz-page-bg-custom`).
 * Не путать с `theme.colors.bg` — токен компонентов (#DEDEDE в custom).
 */
export const usePageBackground = (): string => {
  const themeContext = useContext(AppThemeContext);
  const colorScheme = themeContext?.colorScheme ?? resolveFallbackColorScheme();
  const theme = themeContext?.theme ?? resolveIzTheme(colorScheme);
  return resolvePageBackground(colorScheme, theme);
};
