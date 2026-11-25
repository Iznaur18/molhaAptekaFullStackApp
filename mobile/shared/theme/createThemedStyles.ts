import {
  resolveIzTheme,
  resolvePageBackground,
  type ColorScheme,
  type IzTheme,
} from "@izibuy/design-tokens";
import { useContext, useMemo } from "react";
import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useScreenLayout } from "@/shared/model/useScreenLayout";
import {
  AppThemeContext,
  useAppTheme,
} from "@/shared/theme/AppThemeProvider";
import { resolveThemePreferenceFromSystem } from "@/shared/theme/themePreferenceStorage";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Layout-токены экрана (паритет web CSS vars).
 * Фон корня экрана — только `pageBackground` / `PageCanvas` / `usePageBackground`.
 * Не `theme.colors.bg` (#DEDEDE в custom): это токен компонентов.
 * Новые fontSize/padding — `theme.typography.*` / `theme.spacing[n]`, не raw px.
 */
export type ThemedStyleLayout = {
  contentPaddingHorizontal: number;
  /** Canvas page chrome: custom ≠ `theme.colors.bg` (паритет web `--iz-page-bg-custom`). */
  pageBackground: string;
};

const resolveFallbackColorScheme = (): ColorScheme => {
  const preference = resolveThemePreferenceFromSystem();
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return "custom";
};

export const createThemedStyles = <T extends NamedStyles<T>>(
  factory: (theme: IzTheme, layout: ThemedStyleLayout) => T,
) => {
  return function useThemedStyles(): T {
    const theme = useAppTheme();
    const themeContext = useContext(AppThemeContext);
    const colorScheme =
      themeContext?.colorScheme ?? resolveFallbackColorScheme();
    const { contentPaddingHorizontal } = useScreenLayout();
    const pageBackground = resolvePageBackground(
      colorScheme,
      themeContext?.theme ?? resolveIzTheme(colorScheme),
    );
    // `factory` в deps: после Fast Refresh модуляля стилей старые StyleSheet id
    // иначе остаются в useMemo и Text падает с "Cannot read property 'color' of undefined".
    return useMemo(
      () =>
        StyleSheet.create(
          factory(theme, { contentPaddingHorizontal, pageBackground }),
        ),
      [theme, factory, contentPaddingHorizontal, pageBackground],
    );
  };
};
