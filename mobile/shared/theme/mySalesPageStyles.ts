import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 10.4;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 10.4;
const TOOLBAR_GAP = 8;
const CHIP_GAP = 5.6;
const CHIP_PADDING_VERTICAL = 3.5;
const CHIP_PADDING_HORIZONTAL = 8.8;
const LIST_GAP = 16;

export const useMySalesPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    gap: LIST_GAP,
    flexGrow: 1,
  },
  header: {
    gap: 13.6,
    paddingTop: 12,
    paddingBottom: 12,
  },
  toolbar: {
    gap: TOOLBAR_GAP,
    paddingVertical: TOOLBAR_PADDING_VERTICAL,
    paddingHorizontal: TOOLBAR_PADDING_HORIZONTAL,
    borderRadius: TOOLBAR_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(34, 197, 94, 0.22)",
    backgroundColor: "#f0fdf4",
  },
  toolbarHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  toolbarMeta: {
    alignItems: "flex-end",
    gap: 1.6,
  },
  toolbarHeading: {
    flex: 1,
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
  },
  totalSalesCount: {
    fontSize: 13.6,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
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
    fontWeight: "600",
    lineHeight: 18.7,
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.onContrast,
  },
  searchRoot: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    minHeight: 40,
  },
  searchField: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchClearButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchClearText: {
    fontSize: 20,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  searchSpinner: {
    marginRight: 10,
  },
  emptyState: {
    fontSize: 14.7,
    lineHeight: 21,
    textAlign: "center",
    color: theme.colors.textSecondary,
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    fontWeight: "600",
  },
}));
