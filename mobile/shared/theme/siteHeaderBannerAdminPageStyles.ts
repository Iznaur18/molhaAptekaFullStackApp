import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const SUCCESS_SOFT = "#ecfdf3";
const SUCCESS_BORDER = "#86efac";
const DANGER_STRONG = "#b42318";

export const useSiteHeaderBannerAdminPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    maxWidth: 672,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  status: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  notice: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SUCCESS_BORDER,
    backgroundColor: SUCCESS_SOFT,
  },
  noticeText: {
    fontSize: 14,
    color: theme.colors.text,
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
  legend: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  label: {
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
  },
  fieldHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  empty: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  actions: {
    gap: 10,
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.link,
  },
  buttonSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  buttonDanger: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fecaca",
    backgroundColor: theme.colors.surface,
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  buttonTextDanger: {
    fontSize: 15,
    fontWeight: "600",
    color: DANGER_STRONG,
  },
  error: {
    fontSize: 14,
    color: DANGER_STRONG,
  },
}));
