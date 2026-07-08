import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useDataConfirmationPageStyles = createThemedStyles((theme) => ({
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
    borderColor: theme.colors.infoSoft,
    backgroundColor: theme.colors.infoSoft,
  },
  planTitle: {
    fontSize: 18.4,
    fontWeight: "700",
    color: theme.colors.info,
  },
  planIntro: {
    fontSize: 14.4,
    lineHeight: 20.8,
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
  planNote: {
    fontSize: 13.12,
    lineHeight: 18.4,
    color: theme.colors.textMuted,
  },
  status: {
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
  statusOk: {
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
  },
  statusPending: {
    borderColor: theme.colors.warningSurface,
    backgroundColor: theme.colors.surface,
    color: theme.colors.warningText,
  },
  statusRejected: {
    borderColor: theme.colors.dangerSurface,
    backgroundColor: theme.colors.dangerSurface,
    color: theme.colors.danger,
  },
  submit: {
    alignSelf: "flex-start",
    paddingVertical: 8.8,
    paddingHorizontal: 17.6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.info,
    backgroundColor: theme.colors.infoSoft,
  },
  submitText: {
    fontSize: 15.2,
    fontWeight: "700",
    color: theme.colors.info,
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
