import { StyleSheet } from "react-native";

import { ADMIN_ORDERS_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const CHIP_GAP = 5.6;
const CHIP_PADDING_VERTICAL = 3.5;
const CHIP_PADDING_HORIZONTAL = 8.8;

export const useAdminOrdersPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    flexGrow: 1,
  },
  listInAccountShell: {
    paddingHorizontal: 0,
  },
  header: {
    gap: L.stackGap,
    paddingTop: 0,
    paddingBottom: 0,
  },
  listItemFirst: {
    marginTop: L.stackGap,
  },
  listItem: {
    marginTop: L.listGap,
  },
  toolbar: {
    gap: L.toolbarGap,
    paddingVertical: L.toolbarPadding,
    paddingHorizontal: L.toolbarPaddingHorizontal,
    borderRadius: L.toolbarRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(31, 111, 235, 0.28)",
    backgroundColor: theme.colors.actionSoft,
  },
  toolbarHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  toolbarHeading: {
    flex: 1,
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  ordersCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  statusChips: {
    gap: CHIP_GAP,
    paddingVertical: 2.4,
  },
  statusChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: CHIP_PADDING_VERTICAL,
    paddingHorizontal: CHIP_PADDING_HORIZONTAL,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statusChipText: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 18.7,
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.onContrast,
  },
  state: {
    fontSize: 15.2,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textSecondary,
  },
  stateError: {
    color: theme.colors.danger,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: layout.pageBackground,
  },
}));

export const useOrderStatusSelectStyles = createThemedStyles((theme, layout) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13.6,
    color: theme.colors.textSecondary,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surface,
  },
  optionSelected: {
    borderColor: theme.colors.link,
    backgroundColor: `${theme.colors.link}14`,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  pending: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
  },
  error: {
    width: "100%",
    fontSize: 12.8,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.danger,
  },
}));
