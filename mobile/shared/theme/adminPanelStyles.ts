import { StyleSheet } from "react-native";

import { ADMIN_PANEL_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

export const useAdminPanelStyles = createThemedStyles((theme, layout) => ({
  root: {
    gap: L.stackGap,
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
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: -0.3,
    color: theme.colors.text,
  },
  hint: {
    maxWidth: 672,
    fontSize: theme.typography.fontSm,
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
    backgroundColor: theme.colors.accentSoft,
  },
  countBadgeText: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.accent,
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
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  searchClear: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  searchClearText: {
    fontSize: theme.typography.font2xl,
    lineHeight: theme.typography.leadingBase,
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
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  toolbarButtonPrimaryText: {
    color: theme.colors.onContrast,
  },
  alert: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
  },
  alertError: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.dangerSurface,
    backgroundColor: theme.colors.dangerSurface,
    color: theme.colors.danger,
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
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textSecondary,
  },
  fieldInput: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  fieldHint: {
    fontSize: theme.typography.fontXs,
    lineHeight: theme.typography.leading2xs,
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
    fontSize: theme.typography.font2xs,
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
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
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
    borderColor: `${semanticColors.accent}66`,
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
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  path: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.text,
  },
  slug: {
    fontFamily: "monospace",
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  keywords: {
    fontSize: theme.typography.fontSm,
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
    backgroundColor: theme.colors.accentSoft,
  },
  chipText: {
    fontSize: theme.typography.fontXs,
    lineHeight: theme.typography.leading2xs,
    color: theme.colors.accent,
  },
  chipLeaf: {
    backgroundColor: semanticColors.successSurface,
  },
  chipLeafText: {
    color: semanticColors.successText,
  },
  chipBranch: {
    backgroundColor: theme.colors.actionBorder,
  },
  chipBranchText: {
    color: theme.colors.link,
  },
  chipNeutral: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  chipNeutralText: {
    fontSize: theme.typography.fontXs,
    lineHeight: theme.typography.leading2xs,
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
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  dangerButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  dangerButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.danger,
  },
  editActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pageContainer: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  pageList: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    gap: L.listGap,
    flexGrow: 1,
  },
  /** Desktop hub: без двойного gutter в main-колонке. */
  pageListInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
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
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
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
    fontSize: theme.typography.fontBase,
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
    fontSize: theme.typography.fontSm,
    color: theme.colors.text,
  },
}));
