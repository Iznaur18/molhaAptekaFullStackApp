import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const MODAL_BACKDROP_SCRIM = "rgba(0,0,0,0.45)";

export const useAuthFormStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing[6],
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: theme.spacing[6],
    color: theme.colors.text,
  },
  link: {
    marginTop: theme.spacing[5],
    textAlign: "center",
    color: theme.colors.link,
    fontSize: 15,
  },
}));

export const useFormFieldStyles = createThemedStyles((theme) => ({
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  labelStrong: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  hint: {
    marginTop: theme.spacing[1],
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    marginBottom: theme.spacing[4],
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  inputCompact: {
    marginBottom: 0,
  },
  inputReadOnly: {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  inputCode: {
    fontSize: 20,
    letterSpacing: 4,
    textAlign: "center",
  },
  field: {
    gap: theme.spacing[1],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.danger,
    marginBottom: theme.spacing[3],
    fontSize: 14,
  },
  errorInline: {
    marginBottom: theme.spacing[2],
  },
  success: {
    color: theme.colors.success,
    marginBottom: theme.spacing[2],
    fontSize: 14,
  },
  statusOk: {
    color: theme.colors.success,
    fontSize: 15,
    fontWeight: "600",
  },
  statusPending: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: "600",
  },
  statusRejected: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  switchRow: {
    marginTop: theme.spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    marginRight: theme.spacing[3],
  },
  formScroll: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  submitSpacer: {
    marginTop: theme.spacing[6],
  },
}));

export const useCheckoutFormStyles = createThemedStyles((theme) => ({
  form: {
    gap: 14,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surface,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fieldGroup: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 0,
    fontSize: 15,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
  },
  radioChecked: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  radioLabel: {
    fontSize: 15,
    color: theme.colors.text,
  },
  feedbackError: {
    color: theme.colors.danger,
    fontSize: 14,
  },
  feedbackSuccess: {
    color: theme.colors.success,
    fontSize: 14,
  },
  submitSpacer: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
}));

export const useAddressSuggestStyles = createThemedStyles((theme) => ({
  wrap: {
    marginBottom: theme.spacing[4],
  },
  suggestions: {
    maxHeight: 160,
    marginTop: theme.spacing[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  suggestionRow: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  loader: {
    marginTop: theme.spacing[2],
  },
}));

export const useBottomSheetFormStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP_SCRIM,
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "92%",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    paddingBottom: theme.spacing[6],
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    color: theme.colors.text,
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing[2],
    color: theme.colors.textMuted,
  },
  form: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[6],
    gap: 10,
  },
  selfieSection: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  selfieHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fileName: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  rejectBlock: {
    paddingHorizontal: theme.spacing[4],
    gap: 6,
  },
  staffNote: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  statusPadding: {
    paddingHorizontal: theme.spacing[4],
  },
  modalText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[4],
  },
  secondaryAction: {
    marginTop: theme.spacing[3],
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: theme.colors.link,
    fontSize: 15,
  },
  dismiss: {
    marginTop: theme.spacing[4],
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  sheetPadding: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
}));

export const useAuthGateStyles = createThemedStyles((theme) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    backgroundColor: theme.colors.bg,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
}));
