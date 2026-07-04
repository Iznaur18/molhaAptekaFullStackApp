import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const ACCENT_PURPLE = "#7c3aed";
const ACCENT_PURPLE_SOFT = "#ede9fe";
const DANGER_STRONG = "#b42318";
const DANGER_SURFACE = "#fef3f2";
const DANGER_BORDER = "#fecdca";

export const useAdminPanelStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
    paddingBottom: 4,
  },
  topSlot: {
    marginBottom: 4,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 19.2,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text,
  },
  hint: {
    maxWidth: 672,
    fontSize: 13,
    lineHeight: 19.5,
    color: theme.colors.textMuted,
  },
  toolbar: {
    gap: 8,
  },
  toolbarPrimaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  toolbarActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: ACCENT_PURPLE_SOFT,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: ACCENT_PURPLE,
  },
  searchWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  searchClear: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  searchClearText: {
    fontSize: 18,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  toolbarButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  toolbarButtonPrimary: {
    borderColor: theme.colors.link,
    backgroundColor: theme.colors.link,
  },
  toolbarButtonDisabled: {
    opacity: 0.6,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  toolbarButtonPrimaryText: {
    color: theme.colors.onContrast,
  },
  alert: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  alertError: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DANGER_BORDER,
    backgroundColor: DANGER_SURFACE,
    color: DANGER_STRONG,
  },
  alertInfo: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
  },
  createSection: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  createHeading: {
    paddingTop: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  createBody: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  fieldInput: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  fieldFull: {
    width: "100%",
  },
  formGrid: {
    gap: 12,
  },
  editGrid: {
    gap: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pickerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pickerChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    maxWidth: "100%",
  },
  pickerChipSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  pickerChipText: {
    fontSize: 11,
    color: theme.colors.text,
  },
  createActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  primaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: theme.colors.link,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  list: {
    gap: 8,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  cardEditing: {
    borderColor: "#9333ea66",
  },
  cardBody: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMain: {
    flex: 1,
    minWidth: 160,
    gap: 6,
  },
  token: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  path: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    color: theme.colors.text,
  },
  slug: {
    fontFamily: "monospace",
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  keywords: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: ACCENT_PURPLE_SOFT,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    color: ACCENT_PURPLE,
  },
  chipLeaf: {
    backgroundColor: "#dcfce7",
  },
  chipLeafText: {
    color: "#15803d",
  },
  chipBranch: {
    backgroundColor: "#dbeafe",
  },
  chipBranchText: {
    color: "#2563eb",
  },
  chipNeutral: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  chipNeutralText: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textSecondary,
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  dangerButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DANGER_STRONG,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: DANGER_STRONG,
  },
  editActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pageContainer: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  pageList: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    gap: 8,
    flexGrow: 1,
  },
  curatedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  orderRow: {
    flexDirection: "row",
    gap: 8,
  },
  orderButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  orderButtonDisabled: {
    opacity: 0.45,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  addProductRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 10,
  },
  addProductField: {
    flex: 1,
    minWidth: 180,
  },
  emptyList: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  productItems: {
    gap: 8,
  },
  productItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  productIdText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 13,
    color: theme.colors.text,
  },
}));
