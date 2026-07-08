import { izColors, izColorsDark, type ColorScheme } from "@izibuy/design-tokens";

/** Пиксель-паритет с `client/.../ProductReviewSummary.css`. */
export const resolveProductReviewSummaryPalette = (colorScheme: ColorScheme) => {
  const colors = colorScheme === "dark" ? izColorsDark : izColors;

  return {
    gradientStart: colors.surfaceElevated,
    gradientEnd: colors.warningSurface,
    border: colors.warning,
    starFilled: colors.warning,
  };
};
