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
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  tabPanel: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fieldHint: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  previewCard: {
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  previewEmpty: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  slidePicker: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
  },
  slidePickerRow: {
    gap: 8,
    paddingVertical: 2,
  },
  slidePickerItem: {
    minWidth: 112,
    maxWidth: 160,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  slidePickerItemActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.surfaceMuted,
  },
  slidePickerIndex: {
    alignSelf: "flex-start",
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  slidePickerIndexActive: {
    backgroundColor: theme.colors.action,
    color: theme.colors.onContrast,
  },
  slidePickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  slidePickerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "lowercase",
  },
  slideEditorEmpty: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
  },
  saveBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
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
    backgroundColor: theme.colors.surfaceElevated,
  },
  standalonePanel: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
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
    backgroundColor: theme.colors.surfaceElevated,
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
    borderBottomColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  fieldBlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  fieldBlockActions: {
    backgroundColor: theme.colors.surfaceMuted,
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
    backgroundColor: theme.colors.surface,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  preview: {
    width: "100%",
    backgroundColor: theme.colors.surfaceMuted,
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
    backgroundColor: theme.colors.surface,
  },
  colorInput: {
    flex: 1,
  },
  actions: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.action,
  },
  buttonSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  buttonDanger: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.danger,
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
    color: theme.colors.onContrast,
  },
  error: {
    fontSize: 14,
    color: DANGER_STRONG,
    backgroundColor: DANGER_SOFT,
  },
}));

export const useSiteHeaderBannerAdminTabBarStyles = createThemedStyles((theme) => ({
  root: {
    marginTop: 4,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${theme.colors.action}59`,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.action,
  },
  tabTextActive: {
    color: theme.colors.onContrast,
  },
}));
