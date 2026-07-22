import type { IzTheme } from "@izibuy/design-tokens";
import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const createThemedStyles = <T extends NamedStyles<T>>(factory: (theme: IzTheme) => T) => {
  return function useThemedStyles(): T {
    const theme = useAppTheme();
    // `factory` в deps: после Fast Refresh модуляля стилей старые StyleSheet id
    // иначе остаются в useMemo и Text падает с "Cannot read property 'color' of undefined".
    return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
  };
};
