import { StyleSheet } from "react-native";

import { INSTALLMENT_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const CHIP_PADDING_VERTICAL = 4;
const CHIP_PADDING_HORIZONTAL = 8;
const OVERVIEW_TILE_RADIUS = 16;

export const useInstallmentPaymentsPageStyles = createThemedStyles((theme) => ({
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
    flexGrow: 1,
  },
  /** Desktop hub: shell уже даёт pad; gutter 0 как web `.installment-page`. */
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
    padding: L.toolbarPadding,
    borderRadius: L.toolbarRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
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
  contractsCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
  emptyState: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
  },
  hint: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  overview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7.2,
  },
  overviewTile: {
    flex: 1,
    minWidth: 0,
    gap: 2.4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: OVERVIEW_TILE_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  overviewTileActive: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSurface,
  },
  overviewTileAttention: {
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
  overviewTileStatic: {
    opacity: 1,
  },
  overviewLabel: {
    fontSize: 11.2,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  overviewValueAttention: {
    color: theme.colors.warningText,
  },
  listActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  listAction: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 3.5,
    paddingHorizontal: 8.8,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  listActionText: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  filterHint: {
    flexBasis: "100%",
    fontSize: 13.1,
    color: theme.colors.textMuted,
  },
}));
