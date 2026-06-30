import type { ColorScheme } from "@izibuy/design-tokens";

/** Пиксель-паритет с `client/.../ProductReviewSummary.css` (light). */
const PRODUCT_REVIEW_SUMMARY_LIGHT = {
  gradientStart: "#f8fafc",
  gradientEnd: "#f0eee1",
  border: "#e6d8ab",
  starFilled: "#b45309",
} as const;

/** Dark: surface-elevated → amber-tinted surface-muted. */
const PRODUCT_REVIEW_SUMMARY_DARK = {
  gradientStart: "#1e293b",
  gradientEnd: "#283548",
  border: "#5c4a1a",
  starFilled: "#fbbf24",
} as const;

export const resolveProductReviewSummaryPalette = (colorScheme: ColorScheme) =>
  colorScheme === "dark" ? PRODUCT_REVIEW_SUMMARY_DARK : PRODUCT_REVIEW_SUMMARY_LIGHT;
