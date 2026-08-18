import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 12;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 16;
const TOOLBAR_GAP = 8;
const LIST_GAP = 4;
const SECTION_GAP = 4;
const ROW_GAP = 8;
const ROW_PADDING = 8;
const ROW_RADIUS = 20;
const VIEW_CHIP_GAP = 6;
const VIEW_CHIP_PADDING_VERTICAL = 4;
const VIEW_CHIP_PADDING_HORIZONTAL = 8;
const OVERVIEW_TILE_RADIUS = 16;
const THUMB_SIZE = 52;
const THUMB_RADIUS = 14;

export const useAuctionPageStyles = createThemedStyles((theme) => ({
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
  toolbarCounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 4,
    maxWidth: "52%",
  },
  toolbarCount: {
    fontSize: 12.48,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  section: {
    gap: SECTION_GAP,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 13.12,
    fontWeight: "700",
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  sectionCount: {
    minWidth: 21.6,
    paddingVertical: 1.6,
    paddingHorizontal: 6.4,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textAlign: "center",
    overflow: "hidden",
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
  viewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: VIEW_CHIP_GAP,
    paddingVertical: 2.4,
  },
  viewChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: VIEW_CHIP_PADDING_VERTICAL,
    paddingHorizontal: VIEW_CHIP_PADDING_HORIZONTAL,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  viewChipActive: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warning,
  },
  viewChipText: {
    fontSize: 14.4,
    fontWeight: "600",
    lineHeight: 18.7,
    color: theme.colors.textSecondary,
  },
  viewChipTextActive: {
    color: theme.colors.onContrast,
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

export const useAuctionDashboardRowStyles = createThemedStyles((theme) => ({
  row: {
    gap: ROW_GAP,
    padding: ROW_PADDING,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    borderRadius: ROW_RADIUS,
    borderColor: theme.colors.border,
    borderLeftColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
    elevation: 1,
  },
  rowAttention: {
    borderLeftColor: theme.colors.warning,
    shadowOpacity: 0.1,
  },
  headLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 7.2,
  },
  preview: {
    fontSize: 13.1,
    color: theme.colors.textSecondary,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10.4,
  },
  thumbSlot: {
    flexShrink: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  thumbPlaceholder: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholderText: {
    fontSize: 11.2,
    color: theme.colors.textMuted,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titlePressable: {
    alignSelf: "stretch",
    maxWidth: "100%",
  },
  title: {
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
    flexShrink: 1,
  },
  titleStatic: {
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
    flexShrink: 1,
  },
  metaBlock: {
    gap: 2,
    maxWidth: "100%",
    alignSelf: "stretch",
  },
  metaBuyerPressable: {
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  metaBuyerName: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  metaBuyerNameLink: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.text,
  },
  metaDate: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  meta: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
    flexShrink: 1,
  },
  statusPill: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    paddingVertical: 1.92,
    paddingHorizontal: 7.2,
    borderRadius: 999,
  },
  statusPillPending: {
    backgroundColor: theme.colors.warningSurface,
  },
  statusPillAccepted: {
    backgroundColor: theme.colors.successSurface,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14.4,
    flexShrink: 1,
    color: theme.colors.text,
  },
  statusPillTextPending: {
    color: theme.colors.warningText,
  },
  statusPillTextAccepted: {
    color: theme.colors.successText,
  },
  priceStrip: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 7.2,
    paddingHorizontal: 8.8,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
  },
  priceLabel: {
    fontSize: 11.52,
    fontWeight: "700",
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.text,
  },
  price: {
    fontSize: 16.32,
    fontWeight: "800",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
    flexShrink: 0,
  },
  editor: {
    gap: 6.4,
  },
  editorLabel: {
    fontSize: 11.52,
    fontWeight: "700",
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.text,
  },
  composer: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceMuted,
  },
  composerPrefix: {
    paddingLeft: 10.4,
    paddingRight: 8.8,
    justifyContent: "center",
    fontSize: 15.2,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  composerInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8.8,
    paddingHorizontal: 5.6,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  composerSubmit: {
    justifyContent: "center",
    paddingHorizontal: 13.6,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.action,
  },
  composerSubmitText: {
    fontSize: 13.12,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  editorCancel: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.danger,
  },
  editorCancelText: {
    fontSize: 13.12,
    fontWeight: "600",
    color: theme.colors.onContrast,
    textDecorationLine: "none",
  },
  decision: {
    flexDirection: "row",
    gap: 7.2,
  },
  decisionBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 40.8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8.8,
    paddingHorizontal: 10.4,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  decisionBtnAccept: {
    borderColor: "transparent",
    backgroundColor: theme.colors.success,
  },
  decisionBtnReject: {
    borderColor: "rgba(180, 35, 24, 0.7)",
    backgroundColor: theme.colors.surface,
  },
  decisionBtnTextAccept: {
    fontSize: 14.08,
    fontWeight: "700",
    color: theme.colors.onContrast,
    textAlign: "center",
  },
  decisionBtnTextReject: {
    fontSize: 14.08,
    fontWeight: "700",
    color: theme.colors.danger,
    textAlign: "center",
  },
  cta: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10.4,
    paddingHorizontal: 13.6,
    borderRadius: 14,
    backgroundColor: theme.colors.action,
  },
  ctaText: {
    fontSize: 14.72,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  checkout: {
    marginTop: 4,
  },
  error: {
    fontSize: 13.6,
    color: theme.colors.danger,
  },
  disabled: {
    opacity: 0.65,
  },
  rejectPressed: {
    backgroundColor: theme.colors.dangerSurface,
  },
}));
