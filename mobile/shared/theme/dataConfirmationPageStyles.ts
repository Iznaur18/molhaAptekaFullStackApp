import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const INFO = "#0369a1";
const INFO_LIGHT = "#7dd3fc";
const INFO_PALE = "#f0f9ff";
const INFO_SOFT = "#e0f2fe";
const INFO_SKY = "#0284c7";
const SUCCESS_LIGHT = "#86efac";
const SUCCESS_SOFT = "#ecfdf5";
const SUCCESS_STRONG = "#047857";
const GOLD_BORDER = "#fde68a";
const WARNING_TEXT = "#92400e";
const DANGER_BORDER = "#fecaca";
const DANGER_SURFACE = "#fef3f2";
const DANGER_DEEP = "#b91c1c";
const SLATE = "#475569";

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
    borderColor: INFO_LIGHT,
    backgroundColor: INFO_PALE,
  },
  planTitle: {
    fontSize: 18.4,
    fontWeight: "700",
    color: INFO,
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
    color: SLATE,
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
    borderColor: SUCCESS_LIGHT,
    backgroundColor: SUCCESS_SOFT,
    color: SUCCESS_STRONG,
  },
  statusPending: {
    borderColor: GOLD_BORDER,
    backgroundColor: theme.colors.surface,
    color: WARNING_TEXT,
  },
  statusRejected: {
    borderColor: DANGER_BORDER,
    backgroundColor: DANGER_SURFACE,
    color: DANGER_DEEP,
  },
  submit: {
    alignSelf: "flex-start",
    paddingVertical: 8.8,
    paddingHorizontal: 17.6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INFO_SKY,
    backgroundColor: INFO_SOFT,
  },
  submitText: {
    fontSize: 15.2,
    fontWeight: "700",
    color: INFO,
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
