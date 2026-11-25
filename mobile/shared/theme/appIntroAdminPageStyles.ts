import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useAppIntroAdminPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    maxWidth: 672,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: theme.typography.font3xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  hint: {
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textMuted,
  },
  status: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.textMuted,
  },
  notice: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
  },
  noticeText: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
  },
  noticeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.link,
  },
  noticeButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  form: {
    gap: 16,
  },
  fieldset: {
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  fieldsetDisabled: {
    opacity: 0.65,
  },
  legend: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textSecondary,
  },
  fieldInput: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  fieldHint: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textMuted,
  },
  timingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timingField: {
    flexGrow: 1,
    flexBasis: 144,
    minWidth: 144,
    gap: 6,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: theme.typography.fontMd,
    lineHeight: 21,
    color: theme.colors.text,
  },
  error: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  secondaryButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  primaryButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.link,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
}));
