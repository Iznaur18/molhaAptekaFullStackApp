import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const SUCCESS_SOFT = "#ecfdf3";
const SUCCESS_BORDER = "#86efac";
const DANGER_SOFT = "#fef2f2";
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
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
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
  controlPanel: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  standalonePanel: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  panelSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  slideZone: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  slideTitle: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  fieldBlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  fieldBlockActions: {
    backgroundColor: theme.colors.bg,
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  preview: {
    width: "100%",
    backgroundColor: theme.colors.bg,
  },
  empty: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  colorField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  colorSwatchEmpty: {
    backgroundColor: theme.colors.bg,
  },
  colorInput: {
    flex: 1,
  },
  actions: {
    backgroundColor: theme.colors.bg,
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
    backgroundColor: theme.colors.bg,
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
    backgroundColor: DANGER_SOFT,
  },
}));
