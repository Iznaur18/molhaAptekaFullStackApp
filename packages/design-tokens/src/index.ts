export { DARK_THEME_HARD_BLUE_KEYS, izColors, izColorsCustom, izColorsDark } from "./colors";
export {
  PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
  resolveProductMediaDisplayHeight,
} from "./productMedia";
export { izRadius } from "./radius";
export { izSpacing } from "./spacing";
export { izTypography } from "./typography";

import { izColors, izColorsCustom, izColorsDark } from "./colors";
import { izRadius } from "./radius";
import { izSpacing } from "./spacing";
import { izTypography } from "./typography";

export const izTheme = {
  colors: izColors,
  spacing: izSpacing,
  radius: izRadius,
  typography: izTypography,
} as const;

export const izThemeDark = {
  colors: izColorsDark,
  spacing: izSpacing,
  radius: izRadius,
  typography: izTypography,
} as const;

export const izThemeCustom = {
  colors: izColorsCustom,
  spacing: izSpacing,
  radius: izRadius,
  typography: izTypography,
} as const;

export type IzTheme = {
  colors: { [K in keyof typeof izColors]: string };
  spacing: typeof izSpacing;
  radius: typeof izRadius;
  typography: typeof izTypography;
};

export type ColorScheme = "light" | "dark" | "custom";

export const isDimColorScheme = (scheme: ColorScheme): boolean => scheme === "dark";

export const resolveIzTheme = (scheme: ColorScheme): IzTheme => {
  if (scheme === "dark") {
    return izThemeDark as IzTheme;
  }
  if (scheme === "custom") {
    return izThemeCustom as IzTheme;
  }
  return izTheme as IzTheme;
};
