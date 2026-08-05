import { resolveIzTheme, type ColorScheme } from "@izibuy/design-tokens";

/** Пиксель-паритет с `client/.../ProductReviewSummary.css`. */
export const resolveProductReviewSummaryPalette = (colorScheme: ColorScheme) => {
  const colors = resolveIzTheme(colorScheme).colors;

  return {
    gradientStart: colors.surfaceElevated,
    gradientEnd: colors.warningSurface,
    border: colors.warning,
    starFilled: colors.warning,
  };
};
