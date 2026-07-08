import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useLoyaltyPointsPageStyles = createThemedStyles((theme) => ({
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
  balance: {
    fontSize: 21.6,
    fontWeight: "700",
    color: theme.colors.infoDeep,
    fontVariant: ["tabular-nums"],
  },
  info: {
    fontSize: 14.4,
    lineHeight: 20.8,
    color: theme.colors.textMuted,
  },
  uses: {
    gap: 4,
    paddingLeft: 18.4,
  },
  use: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
  },
  purchase: {
    gap: 8.8,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.infoSoft,
    backgroundColor: theme.colors.surfaceElevated,
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.infoDeep,
  },
  purchaseLabel: {
    gap: 5.6,
    fontSize: 14.4,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  purchaseInput: {
    maxWidth: 192,
    paddingVertical: 8,
    paddingHorizontal: 10.4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderColor: theme.colors.border,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    fontVariant: ["tabular-nums"],
  },
  purchaseHint: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
    lineHeight: 19.5,
  },
  purchasePreview: {
    fontSize: 16.8,
    fontWeight: "700",
    color: theme.colors.infoDeep,
    fontVariant: ["tabular-nums"],
  },
  purchaseError: {
    fontSize: 14.08,
    color: theme.colors.danger,
    lineHeight: 20.2,
  },
  buy: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.action,
  },
  buyDisabled: {
    opacity: 0.55,
  },
  buyText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15.2,
  },
  soon: {
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.infoSoft,
    backgroundColor: theme.colors.actionSoft,
    color: theme.colors.infoDeep,
    fontSize: 14.4,
    lineHeight: 20.2,
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
