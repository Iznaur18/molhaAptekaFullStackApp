import { StyleSheet } from "react-native";

import { MY_ORDERS_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const CHIP_PADDING_VERTICAL = 4;
const CHIP_PADDING_HORIZONTAL = 8;
const OVERVIEW_TILE_RADIUS = 16;

export const useMyOrdersPageStyles = createThemedStyles((theme, layout) => ({
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
    paddingHorizontal: layout.contentPaddingHorizontal,
    flexGrow: 1,
  },
  /** Desktop hub: shell уже даёт pad; gutter 0 как web `.my-orders-page`. */
  listInAccountShell: {
    paddingHorizontal: 0,
  },
  orderCardInList: {
    marginBottom: 0,
  },
  /** web `.my-orders-page { gap: 0.85rem }` между toolbar / overview / list. */
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
  ordersCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  /** web `.my-orders-page__status-chips_all { margin-top: 0.375rem }` поверх gap тулбара. */
  statusChipsAll: {
    marginTop: 6,
  },
  /** web `.my-orders-page__status-more`: пунктирная, без заливки. */
  statusMore: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 999,
    paddingVertical: CHIP_PADDING_VERTICAL,
    paddingHorizontal: CHIP_PADDING_HORIZONTAL,
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
  },
  statusMoreText: {
    fontSize: 14.4,
    fontWeight: "600",
    lineHeight: 18.7,
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
    fontSize: 15.2,
    lineHeight: 21,
  },
  emptyWrap: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  emptyState: {
    fontSize: 14.7,
    lineHeight: 21,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
  /** Guest: как web/cart `.cart-page--centered` + message (live ≤640). */
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  hint: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[4],
  },
  overview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7.2,
  },
  overviewTile: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
    gap: 2.4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: OVERVIEW_TILE_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  overviewTileStatic: {
    opacity: 1,
  },
  /** web `.my-orders-overview__tile_active` — action/actionSoft (live ≤640). */
  overviewTileActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  overviewTileAttention: {
    borderColor: "rgba(217, 119, 6, 0.45)",
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
  filterHint: {
    fontSize: 13.1,
    color: theme.colors.textMuted,
  },
}));
