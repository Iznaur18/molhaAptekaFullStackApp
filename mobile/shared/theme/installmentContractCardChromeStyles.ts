import { StyleSheet } from "react-native";

import { INSTALLMENT_CONTRACT_CARD_LAYOUT as L } from "@/entities/installment/lib/installmentContractCardLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useInstallmentContractCardChromeStyles = createThemedStyles((theme) => ({
  card: {
    gap: L.stackGap,
    paddingVertical: L.paddingY,
    paddingHorizontal: L.paddingX,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: L.radius,
    borderColor: "rgba(79, 70, 229, 0.35)",
    borderLeftWidth: L.borderLeftWidth,
    borderLeftColor: theme.colors.action,
    backgroundColor: theme.colors.surface,
  },
  cardCompleted: {
    borderLeftColor: theme.colors.success,
    backgroundColor: theme.colors.successSurface,
  },
  cardAttention: {
    borderLeftColor: theme.colors.warning,
  },
  /** web `.header` desktop: row space-between; phone ≤640: column. */
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: L.headerGap,
  },
  headerToggle: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: L.headerToggleGap,
    minWidth: 0,
  },
  headerTogglePhone: {
    width: "100%",
  },
  productRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: L.productGap,
    minWidth: 0,
  },
  thumb: {
    width: L.thumbSize,
    height: L.thumbSize,
    borderRadius: L.thumbRadius,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  chevron: {
    flexShrink: 0,
    marginLeft: "auto",
    fontSize: L.chevronFontSize,
    color: theme.colors.textMuted,
    lineHeight: L.chevronFontSize + 2,
  },
  nextDue: {
    fontSize: 13.1,
    color: theme.colors.textSecondary,
  },
  headerBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    flexShrink: 0,
    gap: 8,
  },
  titlePressable: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: L.titleFontSize,
    lineHeight: L.titleLineHeight,
    fontWeight: "700",
    color: theme.colors.text,
  },
  titleStatic: {
    flex: 1,
    minWidth: 0,
    fontSize: L.titleFontSize,
    lineHeight: L.titleLineHeight,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statusPill: {
    paddingVertical: L.statusPillPaddingY,
    paddingHorizontal: L.statusPillPaddingX,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
  },
  statusPillText: {
    fontSize: L.statusPillFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.actionHover,
  },
  statusPillActive: {
    backgroundColor: theme.colors.infoSoft,
  },
  statusPillCompleted: {
    backgroundColor: theme.colors.successSurface,
  },
  statusPillCompletedText: {
    color: theme.colors.successText,
  },
  statusPillDefaulted: {
    backgroundColor: theme.colors.dangerSurface,
  },
  statusPillDefaultedText: {
    color: theme.colors.danger,
  },
  statusPillCancelled: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusPillCancelledText: {
    color: theme.colors.textMuted,
  },
  overdueBadge: {
    paddingVertical: L.overduePaddingY,
    paddingHorizontal: L.overduePaddingX,
    borderRadius: L.overdueRadius,
    backgroundColor: theme.colors.dangerSurface,
  },
  overdueBadgeText: {
    fontSize: L.overdueFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.danger,
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
    backgroundColor: theme.colors.action,
  },
  /** web desktop: inline row; phone compact: muted box. */
  counterparty: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5.6,
    columnGap: 12,
  },
  counterpartyCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    paddingVertical: L.counterpartyPaddingY,
    paddingHorizontal: L.counterpartyPaddingX,
    borderRadius: L.counterpartyRadius,
    backgroundColor: theme.colors.surfaceMuted,
  },
  counterpartyLabel: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  counterpartyLabelCompact: {
    fontSize: theme.typography.fontXs,
  },
  counterpartyName: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.link,
  },
  counterpartyNameCompact: {
    fontSize: L.counterpartyFontSize,
  },
  counterpartyNameStatic: {
    color: theme.colors.text,
  },
  counterpartyDetail: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  counterpartyPhoneLink: {
    color: theme.colors.link,
    textDecorationLine: "underline",
  },
  /** web `.installment-contract-card__summary` auto-fit minmax(5.5rem,1fr). */
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: L.summaryGap,
  },
  summaryTile: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: L.summaryTileMinWidth,
    minWidth: L.summaryTileMinWidth,
    flexDirection: "column",
    gap: L.summaryTileGap,
    paddingVertical: L.summaryTilePaddingY,
    paddingHorizontal: L.summaryTilePaddingX,
    borderRadius: L.summaryTileRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  summaryLabel: {
    fontSize: L.summaryLabelFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    letterSpacing: 0.32,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: L.summaryValueFontSize,
    fontWeight: "700",
    lineHeight: Math.round(L.summaryValueFontSize * 1.25),
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  summaryMuted: {
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  summaryFoot: {
    fontSize: L.summaryFootFontSize,
    lineHeight: Math.round(L.summaryFootFontSize * 1.2),
    color: theme.colors.textMuted,
  },
  payments: {
    gap: 8,
  },
  paymentsTitle: {
    margin: 0,
    fontSize: L.paymentsTitleFontSize,
    fontWeight: "700",
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  fold: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: L.paymentsFoldRadius,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
  },
  foldSummary: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: L.paymentsFoldSummaryMinHeight,
    paddingVertical: L.paymentsFoldSummaryPaddingY,
    paddingHorizontal: L.paymentsFoldSummaryPaddingX,
    gap: 6.4,
  },
  foldSummaryChevron: {
    fontSize: L.paymentsFoldFontSize,
    color: theme.colors.textMuted,
    lineHeight: L.paymentsFoldFontSize + 2,
  },
  foldSummaryText: {
    flex: 1,
    fontSize: L.paymentsFoldFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  /** web `.installment-contract-card__collapsible-region` */
  collapsibleRegion: {
    flexDirection: "column",
    minWidth: 0,
  },
  /** web `.installment-contract-card__fold-inner_body` */
  foldBody: {
    gap: L.stackGap,
  },
  paymentsFoldBody: {
    gap: L.paymentsFoldBodyGap,
    paddingHorizontal: L.paymentsFoldSummaryPaddingX,
    paddingBottom: L.paymentsFoldSummaryPaddingY,
  },
  /** web `.installment-contract-card__payment_compact` + `_remaining` (ink 10% / bg). */
  paymentRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: L.paymentCompactGap,
    paddingVertical: L.paymentCompactPaddingY,
    paddingHorizontal: L.paymentCompactPaddingX,
    borderRadius: L.paymentCompactRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    // rgba: modern `rgb(… / %)` from tokens RN часто не красит.
    backgroundColor: "rgba(17, 24, 39, 0.08)",
  },
  paymentRowRemaining: {
    borderColor: theme.colors.border,
    backgroundColor: "rgba(17, 24, 39, 0.08)",
  },
  paymentRowPaid: {
    borderColor: theme.colors.successSurface,
    backgroundColor: theme.colors.successSurface,
  },
  paymentRowOverdue: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSurface,
  },
  paymentRowPending: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  paymentMain: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: L.paymentMainGap,
    minWidth: 0,
  },
  paymentAmount: {
    fontSize: L.paymentAmountFontSize,
    fontWeight: "700",
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  paymentAmountPaid: {
    color: theme.colors.successText,
  },
  paymentMeta: {
    fontSize: L.paymentMetaFontSize,
    lineHeight: Math.round(L.paymentMetaFontSize * 1.35),
    color: theme.colors.textMuted,
  },
  /** web status pill */
  paymentStatus: {
    alignSelf: "flex-start",
    paddingVertical: L.paymentStatusPaddingY,
    paddingHorizontal: L.paymentStatusPaddingX,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
    fontSize: L.paymentStatusFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  paymentStatusPaid: {
    backgroundColor: theme.colors.successSurface,
    color: theme.colors.successText,
  },
  paymentStatusOverdue: {
    backgroundColor: theme.colors.dangerSurface,
    color: theme.colors.danger,
  },
  paymentStatusPending: {
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.warningText,
  },
  paymentActions: {
    flexDirection: "row",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  /** web `.installment-contract-card__btn` */
  btn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6.4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  btnFullWidth: {
    width: "100%",
  },
  btnFlex: {
    flex: 1,
  },
  btnPrimary: {
    borderColor: theme.colors.link,
    backgroundColor: theme.colors.link,
  },
  btnSuccess: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  btnDanger: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.danger,
  },
  btnCancel: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.danger,
  },
  btnText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  btnTextPrimary: {
    color: theme.colors.onContrast,
  },
  btnTextDanger: {
    color: theme.colors.onContrast,
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  /** web Mobile.css ≤640: column + full-width btns */
  cardActionsPhone: {
    flexDirection: "column",
    gap: 5.6,
  },
  disputeForm: {
    gap: 8,
    width: "100%",
  },
  textarea: {
    minHeight: 72,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: 14.4,
    color: theme.colors.text,
    textAlignVertical: "top",
  },
  error: {
    fontSize: 13.6,
    color: theme.colors.danger,
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
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
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
    borderRadius: 14,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
  },
  actionText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontBase,
  },
  rejectButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
  },
  rejectText: {
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontBase,
  },
  product: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  productLink: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.link,
  },
  sellerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
}));
