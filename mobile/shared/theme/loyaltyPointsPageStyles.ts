import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const INFO_DEEP = "#1e40af";
const INFO_NAVY = "#1e3a8a";
const INFO_MUTED = "#bfdbfe";
const SLATE = "#475569";
const DANGER_STRONG = "#b42318";
const SURFACE_FADE_TOP = "#f8fafc";

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
    color: INFO_DEEP,
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
    color: SLATE,
  },
  purchase: {
    gap: 8.8,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INFO_MUTED,
    backgroundColor: SURFACE_FADE_TOP,
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: INFO_NAVY,
  },
  purchaseLabel: {
    gap: 5.6,
    fontSize: 14.4,
    fontWeight: "600",
    color: SLATE,
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
    color: INFO_DEEP,
    fontVariant: ["tabular-nums"],
  },
  purchaseError: {
    fontSize: 14.08,
    color: DANGER_STRONG,
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
    borderColor: INFO_MUTED,
    backgroundColor: theme.colors.actionSoft,
    color: INFO_DEEP,
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
