import { StyleSheet } from "react-native";

import { MODAL_BACKDROP_SCRIM } from "@/shared/theme/formChromeStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCreateRafflePageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    backgroundColor: theme.colors.bg,
  },
  header: {
    marginBottom: 4,
  },
  /** web `.create-raffle-modal__form { gap: 0.65rem }` */
  form: {
    gap: 10.4,
  },
  wizardProgress: {
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 11.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
  },
  wizardCaption: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.action,
  },
  wizardSteps: {
    flexDirection: "row",
    gap: 6,
  },
  wizardStep: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    opacity: 0.55,
  },
  wizardStepActive: {
    opacity: 1,
  },
  wizardStepComplete: {
    opacity: 1,
  },
  wizardStepIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  wizardStepIndexActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  wizardStepIndexComplete: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSurface,
  },
  wizardStepIndexText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  wizardStepIndexTextActive: {
    color: theme.colors.onContrast,
  },
  wizardStepIndexTextComplete: {
    color: theme.colors.successText,
  },
  wizardStepLabel: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
  stepHeadline: {
    gap: 4,
    marginTop: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  wizardFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  /** web `.create-raffle-modal__actions .app-btn` minH 2.75rem / r 0.7rem */
  wizardSecondaryBtn: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11.2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
  },
  wizardCancelBtn: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  wizardSecondaryBtnText: {
    fontSize: 14.72,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  wizardPrimaryBtn: {
    flex: 1.4,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11.2,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    paddingHorizontal: 12,
  },
  wizardPrimaryBtnText: {
    fontSize: 14.72,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  /** web `.create-raffle-modal__section` r 0.7rem, без shadow. */
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 11.2,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  /** web title: surface-muted + text-secondary (не action fill). */
  sectionTitle: {
    paddingVertical: 8.8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: 12.48,
    fontWeight: "800",
    letterSpacing: 0.62,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
  },
  sectionBody: {
    gap: 11.2,
    padding: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  field: {
    gap: 5.6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  fieldHint: {
    fontSize: 12.48,
    lineHeight: 17.5,
    color: theme.colors.textMuted,
  },
  /** web input bg `--iz-color-bg`, r 8, pad 0.45/0.55rem */
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 8.8,
    paddingVertical: 7.2,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  /** web `.create-raffle-modal__media-type` — border + surface-muted. */
  mediaType: {
    gap: 8,
    paddingVertical: 8.8,
    paddingHorizontal: 10.4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  mediaTypeLegend: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  mediaTypeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  mediaTypeOptionActive: {
    opacity: 1,
  },
  mediaTypeOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  mediaTypeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaTypeDotActive: {
    borderColor: theme.colors.action,
  },
  mediaTypeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.action,
  },
  pageHint: {
    fontSize: 12.8,
    lineHeight: 17.9,
    color: theme.colors.action,
    paddingHorizontal: 4,
  },
  blockNotice: {
    gap: 10.4,
    paddingVertical: 12,
    paddingHorizontal: 12.8,
    borderRadius: 11.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSurface,
  },
  blockNoticeText: {
    fontSize: 13.6,
    lineHeight: 19.5,
    color: theme.colors.danger,
  },
  blockNoticeBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  blockNoticeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  error: {
    fontSize: 13.6,
    lineHeight: 19.5,
    color: theme.colors.danger,
  },
  success: {
    fontSize: 13.6,
    lineHeight: 19.5,
    color: theme.colors.success,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submit: {
    paddingVertical: 8.8,
    paddingHorizontal: 16,
    borderRadius: 11.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    alignSelf: "center",
    minHeight: 44,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: theme.colors.bg,
  },
  state: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  hint: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  loginButton: {
    alignSelf: "stretch",
    minHeight: 40.8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10.4,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14.4,
  },
}));

export const useCreateRaffleModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  closeText: {
    fontSize: 28,
    lineHeight: 28,
    color: theme.colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
}));
