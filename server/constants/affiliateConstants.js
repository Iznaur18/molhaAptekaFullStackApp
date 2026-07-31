/** Партнёрская выплата с объявления (product affiliate). */

export const AFFILIATE_PERCENT_MIN = 1;
export const AFFILIATE_PERCENT_MAX = 50;
export const AFFILIATE_QUERY_PARAM = "aff";
export const AFFILIATE_CLICK_TTL_DAYS = 14;

export const AFFILIATE_LINE_STATUS_NONE = "none";
export const AFFILIATE_LINE_STATUS_PENDING = "pending";
export const AFFILIATE_LINE_STATUS_PAID = "paid";
export const AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM = "skipped_no_program";
export const AFFILIATE_LINE_STATUS_SKIPPED_ANTIFRAUD = "skipped_antifraud";

export const AFFILIATE_LINE_STATUSES = [
  AFFILIATE_LINE_STATUS_NONE,
  AFFILIATE_LINE_STATUS_PENDING,
  AFFILIATE_LINE_STATUS_PAID,
  AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM,
  AFFILIATE_LINE_STATUS_SKIPPED_ANTIFRAUD,
];

export const AFFILIATE_LEDGER_ENTRY_TOP_UP = "top_up";
export const AFFILIATE_LEDGER_ENTRY_PAYOUT = "payout";
export const AFFILIATE_LEDGER_ENTRY_REVERSAL = "reversal";

export const AFFILIATE_LEDGER_ENTRY_TYPES = [
  AFFILIATE_LEDGER_ENTRY_TOP_UP,
  AFFILIATE_LEDGER_ENTRY_PAYOUT,
  AFFILIATE_LEDGER_ENTRY_REVERSAL,
];

export const AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE =
  "Недостаточно баллов лояльности для партнёрской выплаты. Пополните баллы.";

/** @deprecated use AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE */
export const AFFILIATE_INSUFFICIENT_BUDGET_MESSAGE =
  AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE;

export const AFFILIATE_PERCENT_REQUIRED_MESSAGE =
  "При включённой партнёрке укажите процент от 1 до 50";

export const IN_APP_NOTIFICATION_KIND_AFFILIATE_PAYOUT =
  "affiliate_payout_credited";

/** @param {number} amount */
export const IN_APP_NOTIFICATION_MESSAGE_AFFILIATE_PAYOUT = (amount) =>
  `Выплата за приведённого клиента: +${amount} баллов лояльности`;

/**
 * @param {number} linePaidTotal
 * @param {number} percent
 */
export function computeAffiliatePayoutAmount(linePaidTotal, percent) {
  const paid = Math.floor(Number(linePaidTotal));
  const pct = Math.floor(Number(percent));
  if (!Number.isFinite(paid) || paid <= 0 || !Number.isFinite(pct) || pct <= 0) {
    return 0;
  }
  return Math.floor((paid * pct) / 100);
}
