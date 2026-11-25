import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Паритет web `--raffle-participants-inline-padding: var(--iz-space-4)`. */
const SHEET_INLINE_PADDING = 16;

/** Паритет web `RaffleParticipantsSheet.css`. */
export const useRaffleParticipantsSheetStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    // Ширина: на узком = 100% экрана; ≥641 — max 26rem (как web).
    width: "100%",
    height: "92%",
    maxHeight: 576,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 16,
    paddingHorizontal: SHEET_INLINE_PADDING,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  totalBadge: {
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
  },
  totalText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.action,
    fontVariant: ["tabular-nums"],
  },
  close: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  hint: {
    paddingHorizontal: SHEET_INLINE_PADDING,
    paddingBottom: 10,
    fontSize: 12.8,
    lineHeight: theme.typography.leadingXs,
    color: theme.colors.textMuted,
  },
  body: {
    flex: 1,
    minHeight: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingVertical: 6,
    paddingHorizontal: SHEET_INLINE_PADDING,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${theme.colors.border}99`,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rank: {
    width: 26,
    textAlign: "center",
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceMuted,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  count: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.action,
    fontVariant: ["tabular-nums"],
  },
  skeletonRank: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  skeletonName: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    maxWidth: "60%",
  },
  skeletonCount: {
    width: 56,
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  state: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: SHEET_INLINE_PADDING,
  },
  stateText: {
    fontSize: 14.4,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  footnote: {
    paddingTop: 10,
    paddingHorizontal: SHEET_INLINE_PADDING,
    fontSize: 12.5,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
}));
