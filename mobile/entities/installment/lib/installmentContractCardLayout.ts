/**
 * Паритет `InstallmentContractCard.css` + `InstallmentContractCardMobile.css` (≤640).
 */
export const INSTALLMENT_CONTRACT_CARD_LAYOUT = {
  /** compact card */
  stackGap: 7.2, // 0.45rem
  paddingY: 9.6, // 0.6rem
  paddingX: 11.2, // 0.7rem
  radius: 20,
  borderLeftWidth: 3,
  /** header */
  headerGap: 5.6, // 0.35rem
  headerToggleGap: 8.8, // 0.55rem
  productGap: 10.4, // 0.65rem
  thumbSize: 44, // 2.75rem
  thumbRadius: 16,
  titleFontSize: 16.8, // 1.05rem
  titleLineHeight: 21.8,
  chevronFontSize: 16,
  chevronDurationMs: 350,
  /** pills */
  statusPillPaddingY: 1.92,
  statusPillPaddingX: 8,
  statusPillFontSize: 12.8,
  overduePaddingY: 3.2,
  overduePaddingX: 8,
  overdueRadius: 5.6,
  overdueFontSize: 12,
  /** counterparty compact */
  counterpartyPaddingY: 5.6,
  counterpartyPaddingX: 7.2,
  counterpartyRadius: 14,
  counterpartyFontSize: 13.12,
  /**
   * summary — web default `repeat(auto-fit, minmax(5.5rem, 1fr))`
   * (≤640 stack — отдельно, если понадобится phone override).
   */
  summaryGap: 5.6, // 0.35rem
  summaryTileMinWidth: 88, // 5.5rem
  summaryTileGap: 2.4, // 0.15rem
  summaryTilePaddingY: 7.2, // 0.45rem
  summaryTilePaddingX: 8, // 0.5rem
  summaryTileRadius: 14,
  summaryLabelFontSize: 11.52, // 0.72rem
  summaryValueFontSize: 13.12, // 0.82rem
  summaryFootFontSize: 11.52,
  /** payments fold */
  paymentsTitleFontSize: 12.48,
  paymentsFoldSummaryMinHeight: 28, // 1.75rem
  paymentsFoldSummaryPaddingY: 7.2,
  paymentsFoldSummaryPaddingX: 10.4,
  paymentsFoldRadius: 14,
  paymentsFoldFontSize: 13.12,
  paymentsFoldBodyGap: 4.8, // 0.3rem
  /** payment compact */
  paymentCompactGap: 6.4, // 0.4rem
  paymentCompactPaddingY: 8.8, // 0.55rem
  paymentCompactPaddingX: 9.6, // 0.6rem
  paymentCompactRadius: 14,
  paymentMainGap: 3.2, // 0.2rem
  paymentAmountFontSize: 16.8, // 1.05rem
  paymentMetaFontSize: 14, // inherit 0.875rem ≈
  paymentStatusPaddingY: 1.92,
  paymentStatusPaddingX: 7.2,
  paymentStatusFontSize: 12,
  /** passport panel */
  passportGridMinWidth: 160, // 10rem
  passportGridRowGap: 8,
  passportGridColGap: 12,
  passportLabelFontSize: 12,
  passportValueFontSize: 14,
  passportSelfieMax: 192, // 12rem
} as const;
