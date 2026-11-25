/**
 * Паритет web `InlineErrorBanner.css` (1rem = 16).
 */
export const INLINE_ERROR_BANNER_LAYOUT = {
  /** `gap: 0.65rem` */
  gap: 10.4,
  /** `margin: 0 0 0.75rem` */
  marginBottom: 12,
  /** `padding: 0.75rem 0.85rem` */
  paddingY: 12,
  paddingX: 13.6,
  /** `border-radius: 0.65rem` */
  radius: 10.4,
  /** `border: 1px` (aa `47` ≈ color-mix danger 28%) */
  borderWidth: 1,
  /** mark `1.35rem` */
  markSize: 21.6,
  /** mark `margin-top: 0.05rem` */
  markMarginTop: 0.8,
  /** mark `font-size: 0.8rem` (дробный rem — не лестница) */
  markFontSize: 12.8,
  /** text line-height 1.4 × 14 — дробный rem leftover */
  textLineHeight: 19.6,
} as const;
