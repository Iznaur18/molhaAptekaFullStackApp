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

export const useMyOrdersPageStyles = createThemedStyles((theme) => ({
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
    borderColor: "rgba(31, 111, 235, 0.22)",
    backgroundColor: "#eff6ff",
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
    fontWeight: "600",
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
    fontWeight: "600",
    lineHeight: 18.7,
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.onContrast,
  },
  loyaltyFlash: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ecfdf3",
    color: "#027a48",
    fontSize: 15.2,
    lineHeight: 21,
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
