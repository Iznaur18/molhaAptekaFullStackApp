import { StyleSheet } from "react-native";

import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const usePartnerProgramPageStyles = createThemedStyles((theme, layout) => ({
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
  contentInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    gap: 14,
  },
  intro: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  cardHint: {
    fontSize: theme.typography.fontSm,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stat: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
    gap: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statLabel: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.typography.font2xl,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  inviteUrl: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 120,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.borderStrong,
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
    fontVariant: ["tabular-nums"],
  },
  submitButton: {
    width: "100%",
    marginTop: 2,
  },
  feedback: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
    color: theme.colors.infoDeep,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
  },
  feedbackError: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.danger,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
  },
  empty: {
    fontSize: 14.5,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  referralRow: {
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  referralName: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  referralMeta: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textSecondary,
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
    borderRadius: 8,
    backgroundColor: theme.colors.action,
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: 15.2,
  },
}));
