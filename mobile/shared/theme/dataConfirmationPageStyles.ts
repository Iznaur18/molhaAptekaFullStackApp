import { Platform, StyleSheet } from "react-native";

import { DATA_CONFIRMATION_MODAL_LAYOUT as M } from "@/entities/user-data-confirmation/lib/dataConfirmationModalLayout";
import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { MODAL_BACKDROP_SCRIM } from "@/shared/theme/formChromeStyles";

export const useDataConfirmationPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: L.stackGap,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
  },
  /** Desktop hub: shell уже даёт gutter. */
  contentInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    gap: 14,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 20,
    borderRadius: 18,
    backgroundColor: theme.colors.info,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroTitle: {
    fontSize: theme.typography.font4xl,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: theme.colors.onContrast,
  },
  heroInfo: {
    marginTop: 8,
    fontSize: theme.typography.fontSm,
    lineHeight: 19,
    color: theme.colors.onContrast,
    opacity: 0.8,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  benefitsCard: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  benefitsTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  benefitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.infoSoft,
  },
  benefitText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.5,
    lineHeight: theme.typography.leadingBase,
    paddingTop: 6,
    color: theme.colors.textSecondary,
  },
  planNote: {
    fontSize: theme.typography.fontSm,
    lineHeight: 18.5,
    color: theme.colors.textMuted,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
  statusOk: {
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
  },
  statusOkText: {
    color: theme.colors.successText,
  },
  statusPending: {
    borderColor: theme.colors.warningBorder,
    backgroundColor: theme.colors.warningSurface,
  },
  statusPendingText: {
    color: theme.colors.warningText,
  },
  statusRejected: {
    borderColor: theme.colors.dangerSurface,
    backgroundColor: theme.colors.dangerSurface,
  },
  statusRejectedText: {
    color: theme.colors.danger,
  },
  submitButton: {
    width: "100%",
    backgroundColor: theme.colors.info,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: layout.pageBackground,
  },
  hint: {
    fontSize: theme.typography.fontLg,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: 15.2,
  },
}));

/** Паритет web `data-confirmation-modal` — phone fullscreen / tablet card. */
export const useDataConfirmationRequestModalStyles = createThemedStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  hostPhone: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
  },
  hostTablet: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: M.backdropPadding,
  },
  cardPhone: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
    borderRadius: 0,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    paddingTop: M.paddingTop,
    paddingHorizontal: M.paddingX,
    paddingBottom: M.paddingBottom,
  },
  cardTablet: {
    width: "100%",
    maxWidth: M.maxWidth,
    maxHeight: `${M.maxHeightRatio * 100}%`,
    borderRadius: M.radius,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    paddingTop: M.paddingTop,
    paddingHorizontal: M.paddingX,
    paddingBottom: M.paddingBottom,
    shadowColor: theme.colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: M.headerGap,
    marginBottom: M.headerMarginBottom,
  },
  title: {
    flex: 1,
    fontSize: M.titleFontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  intro: {
    fontSize: M.introFontSize,
    lineHeight: Math.round(M.introFontSize * 1.4),
    marginBottom: M.introMarginBottom,
    color: theme.colors.textMuted,
  },
  formScroll: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  form: {
    gap: 0,
    paddingBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: M.gridColumnGap,
    rowGap: M.gridRowGap,
  },
  fieldHalf: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "40%",
    minWidth: 140,
  },
  fieldFull: {
    width: "100%",
    flexBasis: "100%",
  },
  field: {
    gap: M.fieldGap,
  },
  fieldLabel: {
    fontSize: M.fieldLabelFontSize,
    color: theme.colors.textSecondary,
  },
  passportInput: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: M.inputRadius,
    paddingHorizontal: M.inputPaddingX,
    paddingVertical: M.inputPaddingY,
    fontSize: M.inputFontSize,
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
  },
  passportInputMultiline: {
    minHeight: 64,
    textAlignVertical: "top" as const,
  },
  stepMeta: {
    gap: M.stepMetaGap,
    marginBottom: M.stepMetaMarginBottom,
  },
  stepProgress: {
    fontSize: M.stepProgressFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  stepTitle: {
    fontSize: M.stepTitleFontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  stepActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: M.actionsGap,
    marginTop: M.actionsMarginTop,
  },
  selfieSection: {
    gap: M.selfieGap,
    marginTop: M.selfieMarginTop,
  },
  selfieHint: {
    fontSize: M.selfieHintFontSize,
    color: theme.colors.textMuted,
  },
  preview: {
    width: "100%",
    maxWidth: M.selfiePreviewMaxWidth,
    height: M.selfiePreviewMaxHeight,
    marginTop: 6,
    borderRadius: M.selfiePreviewRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  fileName: {
    fontSize: M.fieldLabelFontSize,
    color: theme.colors.textMuted,
  },
  rejectBlock: {
    gap: 6,
    marginBottom: 12,
  },
  staffNote: {
    padding: M.staffNotePadding,
    borderRadius: M.staffNoteRadius,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: M.introFontSize,
    lineHeight: Math.round(M.introFontSize * 1.4),
    color: theme.colors.textMuted,
  },
  statusText: {
    marginBottom: 12,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  stateText: {
    marginVertical: 8,
    fontSize: M.introFontSize,
    color: theme.colors.textMuted,
  },
  stateError: {
    marginVertical: 8,
    fontSize: M.introFontSize,
    color: theme.colors.danger,
  },
}));
