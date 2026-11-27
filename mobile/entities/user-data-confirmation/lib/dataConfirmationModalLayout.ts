/**
 * Паритет client `DataConfirmationRequestModal.css`.
 * Scrim фона: `MODAL_BACKDROP_SCRIM` (`rgba(0,0,0,0.45)`), не `theme.colors.overlay`
 * (modern `rgb(a b c / %)` RN часто не красит).
 */
export const DATA_CONFIRMATION_MODAL_LAYOUT = {
  /** web `@media (max-width: 640px)` → fullscreen */
  phoneMaxWidthPx: 640,
  /** web `@media (max-width: 480px)` → grid 1 col */
  gridSingleColMaxWidthPx: 480,
  /** `width: min(32rem, 100%)` */
  maxWidth: 512,
  /** `max-height: min(88vh, 100%)` */
  maxHeightRatio: 0.88,
  /** backdrop `padding: 1.25rem` (tablet) */
  backdropPadding: 20,
  /** card `border-radius: 20px` (tablet); phone = 0 */
  radius: 20,
  /** card padding `1.25rem / 1.25rem / 1.35rem` */
  paddingX: 20,
  paddingTop: 20,
  paddingBottom: 22,
  /** header `margin-bottom: 0.75rem`, title `1.125rem` */
  headerGap: 12,
  headerMarginBottom: 12,
  titleFontSize: 18,
  closeIconSize: 22,
  /** intro `0.875rem`, margin-bottom `0.75rem` */
  introFontSize: 14,
  introMarginBottom: 12,
  /** step-meta */
  stepMetaGap: 2,
  stepMetaMarginBottom: 12,
  stepProgressFontSize: 12,
  stepTitleFontSize: 16,
  /** grid `gap: 0.65rem 0.75rem` */
  gridRowGap: 10,
  gridColumnGap: 12,
  /** field label `0.75rem` */
  fieldLabelFontSize: 12,
  fieldGap: 4,
  /** input padding / radius / 16px anti-zoom */
  inputPaddingY: 9,
  inputPaddingX: 10,
  inputRadius: 8,
  inputFontSize: 16,
  /** actions `gap: 0.5rem`, `margin-top: 1rem` */
  actionsGap: 8,
  actionsMarginTop: 16,
  /** selfie */
  selfieGap: 6,
  selfieMarginTop: 14,
  selfieHintFontSize: 11,
  selfiePreviewMaxWidth: 256,
  selfiePreviewMaxHeight: 192,
  selfiePreviewRadius: 8,
  staffNotePadding: 12,
  staffNoteRadius: 8,
} as const;
