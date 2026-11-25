export { izColors, izColorsCustom, izColorsDark, IZ_COLOR_COMPAT_KEYS } from "./colors";
export {
  PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
  resolveProductMediaDisplayHeight,
} from "./productMedia";
export { izRadius } from "./radius";
export { izSpacing } from "./spacing";
export { izTypography } from "./typography";
export { izInteraction } from "./interaction";
export { izModalBackdropScrim, izModalBackdropScrimCss } from "./scrim";
export { izPageBgCustom } from "./pageBg";
export { izLayout } from "./layout";
export { izShadows } from "./shadows";
export { izGradients, type IzGradientName } from "./gradients";
export { izIconSizes, izIconStrokeNav, type IzIconSize } from "./iconSizes";
export {
  izSocialBrandColors,
  izSocialBrandBadgeSolidByFieldId,
  type IzSocialBrandFieldId,
} from "./socialBrandColors";
export { izProductBadgeColors } from "./productBadgeColors";

import { izColors, izColorsCustom, izColorsDark } from "./colors";
import { izInteraction } from "./interaction";
import { izLayout } from "./layout";
import { izPageBgCustom } from "./pageBg";
import { izRadius } from "./radius";
import { izSpacing } from "./spacing";
import { izTypography } from "./typography";

export const izTheme = {
  colors: izColors,
  spacing: izSpacing,
  radius: izRadius,
  typography: izTypography,
  interaction: izInteraction,
  layout: izLayout,
} as const;

export const izThemeDark = {
  colors: izColorsDark,
  spacing: izSpacing,
  radius: izRadius,
  typography: izTypography,
  interaction: izInteraction,
  layout: izLayout,
} as const;

export const izThemeCustom = {
  colors: izColorsCustom,
  spacing: izSpacing,
  radius: izRadius,
  typography: izTypography,
  interaction: izInteraction,
  layout: izLayout,
} as const;

export type IzTheme = {
  colors: { [K in keyof typeof izColors]: string };
  spacing: typeof izSpacing;
  radius: typeof izRadius;
  typography: typeof izTypography;
  interaction: typeof izInteraction;
  layout: typeof izLayout;
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

/** Canvas под shell: custom page chrome ≠ token `colors.bg`. */
export const resolvePageBackground = (
  scheme: ColorScheme,
  theme: IzTheme = resolveIzTheme(scheme),
): string => (scheme === "custom" ? izPageBgCustom : theme.colors.bg);
