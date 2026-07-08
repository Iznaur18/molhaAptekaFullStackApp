import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCategoryPickerSheetStyles = createThemedStyles((theme) => ({
  // ── Поле-селект в форме ──
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 15,
    lineHeight: 20,
    color: theme.colors.text,
  },
  fieldPlaceholder: {
    color: theme.colors.textMuted,
  },
  fieldChevron: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  // ── Шторка ──
  sheetRoot: {
    flex: 1,
    backgroundColor: theme.colors.bg,
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
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  sheetClose: {
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 15,
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
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 15,
    lineHeight: 20,
    color: theme.colors.text,
  },
  rowPath: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  rowChevron: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    opacity: 0.55,
  },
  rowLeafMark: {
    fontSize: 15,
    fontWeight: "700",
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
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.danger,
  },
}));
