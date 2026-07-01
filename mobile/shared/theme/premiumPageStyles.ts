import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const GOLD = "#d4af37";
const GOLD_MUTED = "#7a5a00";
const GOLD_DEEP = "#d4a017";
const GOLD_HIGHLIGHT = "#ffefb8";
const PROMOTION_BOOST_BG = "#fffbeb";
const SUCCESS_LIGHT = "#86efac";
const SUCCESS_SOFT = "#ecfdf5";
const SUCCESS_STRONG = "#047857";
const DANGER_STRONG = "#b42318";
const SLATE = "#475569";

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
    borderColor: GOLD,
    backgroundColor: PROMOTION_BOOST_BG,
  },
  planTitle: {
    fontSize: 18.4,
    fontWeight: "700",
    color: GOLD_MUTED,
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
    color: SLATE,
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
    borderColor: SUCCESS_LIGHT,
    backgroundColor: SUCCESS_SOFT,
    color: SUCCESS_STRONG,
    fontSize: 14.4,
    lineHeight: 20.2,
  },
  error: {
    fontSize: 14.08,
    color: DANGER_STRONG,
    lineHeight: 20.2,
  },
  submit: {
    alignSelf: "flex-start",
    paddingVertical: 8.8,
    paddingHorizontal: 17.6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_DEEP,
    backgroundColor: "#fff8e6",
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontSize: 15.2,
    fontWeight: "700",
    color: GOLD_MUTED,
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
