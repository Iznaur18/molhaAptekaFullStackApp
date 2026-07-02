import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 10.4;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 10.4;
const TOOLBAR_GAP = 8;
const LIST_GAP = 16;
const SECTION_GAP = 8.8;
const ROW_GAP = 8.8;
const ROW_PADDING = 12;
const ROW_RADIUS = 12;
const THUMB_SIZE = 52;
const THUMB_RADIUS = 7.2;

const SUCCESS_TEAL_BRIGHT = "#0d9488";
const SUCCESS_PALE = "#dcfce7";
const SUCCESS_FOREST = "#065f46";
const WARNING_YELLOW_SOFT = "#fefce8";
const WARNING_BROWN_DARK = "#854d0e";
const DANGER_STRONG = "#b42318";
const DANGER_SURFACE = "#fef3f2";

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
    borderColor: "rgba(217, 119, 6, 0.24)",
    backgroundColor: WARNING_YELLOW_SOFT,
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
    borderRadius: 8,
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

export const useAuctionDashboardRowStyles = createThemedStyles((theme) => ({
  row: {
    gap: ROW_GAP,
    padding: ROW_PADDING,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: ROW_RADIUS,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
    elevation: 1,
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
    color: theme.colors.actionHover,
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
    color: theme.colors.actionHover,
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
    backgroundColor: WARNING_YELLOW_SOFT,
  },
  statusPillAccepted: {
    backgroundColor: SUCCESS_PALE,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14.4,
    flexShrink: 1,
  },
  statusPillTextPending: {
    color: WARNING_BROWN_DARK,
  },
  statusPillTextAccepted: {
    color: SUCCESS_FOREST,
  },
  priceStrip: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 7.2,
    paddingHorizontal: 8.8,
    borderRadius: 8.8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  priceLabel: {
    fontSize: 11.52,
    fontWeight: "700",
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  price: {
    fontSize: 16.32,
    fontWeight: "800",
    color: theme.colors.link,
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
    color: theme.colors.textMuted,
  },
  composer: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10.4,
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
  },
  editorCancelText: {
    fontSize: 13.12,
    fontWeight: "600",
    color: DANGER_STRONG,
    textDecorationLine: "underline",
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
    borderRadius: 10.4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  decisionBtnAccept: {
    borderColor: "transparent",
    backgroundColor: SUCCESS_TEAL_BRIGHT,
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
    color: DANGER_STRONG,
    textAlign: "center",
  },
  cta: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10.4,
    paddingHorizontal: 13.6,
    borderRadius: 11.2,
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
    color: DANGER_STRONG,
  },
  disabled: {
    opacity: 0.65,
  },
  rejectPressed: {
    backgroundColor: DANGER_SURFACE,
  },
}));
