import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

export const usePremiumPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  header: {
    gap: 13.6,
  },
  plan: {
    gap: 13.6,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  planTitle: {
    fontSize: 18.4,
    fontWeight: "700",
    color: theme.colors.warningText,
  },
  planPrice: {
    fontSize: 21.6,
    fontWeight: "700",
    color: theme.colors.ink,
    fontVariant: ["tabular-nums"],
  },
  planPeriod: {
    fontSize: 14.4,
    color: theme.colors.textMuted,
  },
  benefits: {
    gap: 4,
    paddingLeft: 18.4,
  },
  benefit: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
  },
  balance: {
    fontSize: 14.08,
    color: theme.colors.textMuted,
  },
  active: {
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
  error: {
    fontSize: 14.08,
    color: theme.colors.danger,
    lineHeight: 20.2,
  },
  submit: {
    alignSelf: "flex-start",
    paddingVertical: 8.8,
    paddingHorizontal: 17.6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.warning,
    backgroundColor: semanticColors.warningSurface,
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontSize: 15.2,
    fontWeight: "700",
    color: theme.colors.warningText,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
  hint: {
    fontSize: 16,
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
    fontWeight: "600",
    fontSize: 15.2,
  },
}));
