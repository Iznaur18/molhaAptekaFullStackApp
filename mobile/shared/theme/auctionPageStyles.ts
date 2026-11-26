import { StyleSheet } from "react-native";

import { AUCTION_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const SECTION_GAP = 4;
/** web `.auction-dashboard-row { gap: 0.65rem }` */
const ROW_GAP = 10.4;
/** web `.auction-dashboard-row { padding: 0.75rem }` */
const ROW_PADDING = 12;
/** web `.auction-dashboard-row { border-radius: 18px }` */
const ROW_RADIUS = 18;
const VIEW_CHIP_PADDING_VERTICAL = 4;
const VIEW_CHIP_PADDING_HORIZONTAL = 8;
/** web `.auction-dashboard-row__thumb` 3.25rem / r12 */
const THUMB_SIZE = 52;
const THUMB_RADIUS = 12;
/** web `.auction-dashboard-row__btn { border-radius: 12px; min-height: 2.5rem }` */
const DECISION_BTN_RADIUS = 12;
const DECISION_BTN_MIN_HEIGHT = 40;

export const useAuctionPageStyles = createThemedStyles((theme, layout) => ({
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
  /** Desktop hub: shell уже даёт pad; gutter 0 как web `.auction-page`. */
  listInAccountShell: {
    paddingHorizontal: 0,
  },
  /** web `.auction-page { gap: 0.85rem }` между toolbar / overview / list. */
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
    fontWeight: theme.typography.fontWeightBold,
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
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
    textAlign: "center",
    overflow: "hidden",
  },
  emptyState: {
    fontSize: theme.typography.fontLg,
    color: theme.colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  hint: {
    fontSize: theme.typography.fontLg,
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
    fontWeight: theme.typography.fontWeightSemibold,
  },
  /** web `.auction-page__chips` — 2-сегментный switcher. */
  viewSwitch: {
    flexDirection: "row",
    gap: 3.2,
    padding: 3.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  viewSwitchTab: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: VIEW_CHIP_PADDING_VERTICAL + 2,
    paddingHorizontal: VIEW_CHIP_PADDING_HORIZONTAL,
    borderRadius: 10,
  },
  viewSwitchTabActive: {
    backgroundColor: theme.colors.nearBlack,
  },
  viewSwitchTabText: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 18,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  viewSwitchTabTextActive: {
    color: theme.colors.onContrast,
  },
}));

export const useAuctionDashboardRowStyles = createThemedStyles((theme, layout) => ({
  row: {
    gap: ROW_GAP,
    padding: ROW_PADDING,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: ROW_RADIUS,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  /** web `.auction-dashboard-row_attention` — warning border, без left strip. */
  rowAttention: {
    borderColor: "rgba(217, 119, 6, 0.6)",
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
    gap: 3.2,
  },
  titlePressable: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
  },
  title: {
    fontSize: 14.72,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 19.2,
    color: theme.colors.text,
    flexShrink: 1,
  },
  titleStatic: {
    fontSize: 14.72,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 19.2,
    color: theme.colors.text,
    flexShrink: 1,
  },
  metaInline: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    maxWidth: "100%",
    alignSelf: "stretch",
  },
  metaBuyerPressable: {
    flexShrink: 1,
    maxWidth: "100%",
  },
  metaBuyerName: {
    fontSize: 12.8,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  metaBuyerNameLink: {
    fontSize: 12.8,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  metaDate: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
  },
  meta: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
    flexShrink: 1,
  },
  /** web `.auction-dashboard-row__price-box` */
  priceBox: {
    flexShrink: 0,
    alignItems: "flex-end",
    gap: 0.8,
    paddingLeft: 4,
  },
  priceBoxValue: {
    fontSize: 18.4,
    fontWeight: "800",
    lineHeight: 21.2,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  priceBoxCaption: {
    fontSize: 11.52,
    color: theme.colors.textMuted,
  },
  statusPill: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    marginTop: 2.4,
    paddingVertical: 2.4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusPillNeutral: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusPillAttention: {
    backgroundColor: theme.colors.warningSurface,
  },
  statusPillSuccess: {
    backgroundColor: theme.colors.successSurface,
  },
  statusPillText: {
    fontSize: 11.84,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 14.8,
    flexShrink: 1,
  },
  statusPillTextNeutral: {
    color: theme.colors.textSecondary,
  },
  statusPillTextAttention: {
    color: theme.colors.warningText,
  },
  statusPillTextSuccess: {
    color: theme.colors.successText,
  },
  /** web `.auction-dashboard-row__actions` */
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: DECISION_BTN_MIN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DECISION_BTN_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionBtnSecondary: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  actionBtnSecondaryText: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  textBtn: {
    flexShrink: 0,
    alignSelf: "center",
    paddingVertical: 6.4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  textBtnLabel: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  textBtnDanger: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.danger,
  },
  /** web `.auction-dashboard-row__editor` — row: composer + close */
  editor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6.4,
  },
  composer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: DECISION_BTN_RADIUS,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  composerPrefix: {
    paddingLeft: 10.4,
    paddingRight: 6.4,
    alignSelf: "center",
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textMuted,
  },
  composerInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 5.6,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  composerSubmit: {
    justifyContent: "center",
    paddingHorizontal: 13.6,
    backgroundColor: theme.colors.action,
  },
  composerSubmitText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.onContrast,
  },
  decision: {
    flexDirection: "row",
    gap: 8,
  },
  decisionBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: DECISION_BTN_MIN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DECISION_BTN_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
  },
  decisionBtnAccept: {
    borderColor: "transparent",
    backgroundColor: theme.colors.success,
  },
  /** web `.auction-dashboard-row__btn_secondary` — reject = secondary, не danger. */
  decisionBtnReject: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  decisionBtnTextAccept: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.onContrast,
    textAlign: "center",
  },
  decisionBtnTextReject: {
    fontSize: 14.08,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
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
    fontWeight: theme.typography.fontWeightBold,
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
