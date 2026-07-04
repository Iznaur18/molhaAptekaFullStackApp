import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const LINK_DEEP = "#4f46e5";
const SUCCESS_TEAL_BRIGHT = "#0d9488";
const SUCCESS_PALE = "#dcfce7";
const SUCCESS_FOREST = "#065f46";
const SUCCESS_SURFACE = "#f0fdf4";
const DANGER_STRONG = "#b42318";
const DANGER_SURFACE = "#fef3f2";
const DANGER_ACCENT = "#dc2626";

const PAYMENTS_FOLD_SUMMARY_PADDING_VERTICAL = 9;
const PAYMENTS_FOLD_SUMMARY_MIN_HEIGHT = 47;

export const useInstallmentContractCardChromeStyles = createThemedStyles((theme) => ({
  card: {
    gap: 7.2,
    paddingVertical: 9.6,
    paddingHorizontal: 11.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8.8,
    borderColor: "rgba(79, 70, 229, 0.35)",
    borderLeftWidth: 3,
    borderLeftColor: LINK_DEEP,
    backgroundColor: theme.colors.surface,
    shadowColor: LINK_DEEP,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompleted: {
    borderLeftColor: SUCCESS_TEAL_BRIGHT,
    backgroundColor: SUCCESS_SURFACE,
  },
  cardAttention: {
    borderLeftColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.14,
  },
  headerToggle: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chevron: {
    width: 20,
    height: 20,
    borderRadius: 999,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceMuted,
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }],
  },
  nextDue: {
    fontSize: 13.1,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  headerBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  titlePressable: {
    width: "100%",
    minWidth: 0,
  },
  title: {
    fontSize: 15.2,
    lineHeight: 21,
    fontWeight: "600",
    color: theme.colors.action,
  },
  titleStatic: {
    width: "100%",
    minWidth: 0,
    fontSize: 15.2,
    lineHeight: 21,
    fontWeight: "600",
    color: theme.colors.text,
  },
  statusPill: {
    paddingVertical: 1.92,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
  },
  statusPillText: {
    fontSize: 12.8,
    fontWeight: "600",
    color: theme.colors.actionHover,
  },
  statusPillActive: {
    backgroundColor: "#dbeafe",
  },
  statusPillCompleted: {
    backgroundColor: SUCCESS_PALE,
  },
  statusPillCompletedText: {
    color: SUCCESS_FOREST,
  },
  statusPillDefaulted: {
    backgroundColor: DANGER_SURFACE,
  },
  statusPillDefaultedText: {
    color: DANGER_STRONG,
  },
  statusPillCancelled: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusPillCancelledText: {
    color: theme.colors.textMuted,
  },
  overdueBadge: {
    paddingVertical: 3.2,
    paddingHorizontal: 8,
    borderRadius: 5.6,
    backgroundColor: DANGER_SURFACE,
  },
  overdueBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: DANGER_STRONG,
  },
  progress: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: LINK_DEEP,
  },
  counterparty: {
    gap: 2,
  },
  counterpartyLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  counterpartyName: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.actionHover,
  },
  counterpartyNameStatic: {
    color: theme.colors.text,
  },
  counterpartyDetail: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryTile: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
    gap: 2,
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  summaryLabel: {
    fontSize: 11.2,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 14.4,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  summaryMuted: {
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  summaryFoot: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  payments: {
    gap: 8,
  },
  paymentsTitle: {
    fontSize: 14.4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  fold: {
    gap: 6,
  },
  foldSummary: {
    minHeight: PAYMENTS_FOLD_SUMMARY_MIN_HEIGHT,
    justifyContent: "center",
    paddingVertical: PAYMENTS_FOLD_SUMMARY_PADDING_VERTICAL,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  foldSummaryText: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  foldBody: {
    gap: 6,
  },
  paymentRow: {
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  paymentRowPaid: {
    opacity: 0.85,
  },
  paymentRowOverdue: {
    backgroundColor: DANGER_SURFACE,
  },
  paymentRowPending: {
    backgroundColor: "#fffbeb",
  },
  paymentMain: {
    gap: 4,
  },
  paymentAmount: {
    fontSize: 15.2,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  paymentMeta: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
  },
  paymentStatus: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  paymentStatusPaid: {
    color: SUCCESS_FOREST,
  },
  paymentStatusOverdue: {
    color: DANGER_STRONG,
  },
  paymentStatusPending: {
    color: "#92400e",
  },
  paymentActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btn: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7.2,
    paddingHorizontal: 10.4,
    borderRadius: 6.4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  btnPrimary: {
    borderColor: LINK_DEEP,
    backgroundColor: LINK_DEEP,
  },
  btnSuccess: {
    borderColor: SUCCESS_TEAL_BRIGHT,
    backgroundColor: SUCCESS_TEAL_BRIGHT,
  },
  btnDanger: {
    borderColor: "rgba(220, 38, 38, 0.7)",
    backgroundColor: theme.colors.surface,
  },
  btnCancel: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.danger,
  },
  btnText: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.text,
  },
  btnTextPrimary: {
    color: theme.colors.onContrast,
  },
  btnTextDanger: {
    color: DANGER_ACCENT,
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  disputeForm: {
    gap: 8,
    width: "100%",
  },
  textarea: {
    minHeight: 72,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6.4,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: 14.4,
    color: theme.colors.text,
    textAlignVertical: "top",
  },
  error: {
    fontSize: 13.6,
    color: DANGER_STRONG,
  },
  disabled: {
    opacity: 0.65,
  },
  meta: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  paymentsTitleLegacy: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  paymentRowLegacy: {
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
  },
  actionText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
  },
  rejectText: {
    color: theme.colors.danger,
    fontWeight: "600",
    fontSize: 14,
  },
  product: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  productLink: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.link,
  },
  sellerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
}));
