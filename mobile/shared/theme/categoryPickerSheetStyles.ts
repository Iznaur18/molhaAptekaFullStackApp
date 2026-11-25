import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCategoryPickerSheetStyles = createThemedStyles((theme, layout) => ({
  // ── Поле-селект в форме ──
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  fieldBoxPressed: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  fieldValue: {
    flex: 1,
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.text,
  },
  fieldPlaceholder: {
    color: theme.colors.textMuted,
  },
  fieldChevron: {
    fontSize: theme.typography.fontLg,
    color: theme.colors.textSecondary,
  },

  // ── Шторка ──
  sheetRoot: {
    flex: 1,
    backgroundColor: layout.pageBackground,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
    gap: theme.spacing[3],
  },
  sheetTitle: {
    flex: 1,
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  sheetClose: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.link,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },

  // ── Хлебные крошки ──
  crumbs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  crumbChip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  crumbChipCurrent: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  crumbText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.action,
  },
  crumbTextCurrent: {
    color: theme.colors.onContrast,
  },

  // ── Список ──
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  tilesContent: {
    paddingTop: theme.spacing[1],
  },
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  rowFirst: {
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
  },
  rowPressed: {
    backgroundColor: theme.colors.actionSurface,
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.text,
  },
  rowPath: {
    fontSize: theme.typography.fontXs,
    lineHeight: theme.typography.leading2xs,
    color: theme.colors.textMuted,
  },
  rowChevron: {
    fontSize: theme.typography.font2xl,
    color: theme.colors.textSecondary,
    opacity: 0.55,
  },
  rowLeafMark: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.action,
  },

  // ── Статусы ──
  statusWrap: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  statusText: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.danger,
  },
}));
