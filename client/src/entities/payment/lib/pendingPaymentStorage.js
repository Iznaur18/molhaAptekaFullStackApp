import { reportClientIssue } from "../../../shared/lib/reportClientIssue.js";
/**
 * Id платежа, с которым покупатель ушёл на форму оплаты.
 *
 * Адрес возврата ЮKassa фиксирует в момент создания платежа, когда id ещё не
 * известен, — поэтому id переживает редирект здесь, а не в query-строке.
 * sessionStorage: возврат приходит в ту же вкладку, и хвост не остаётся
 * висеть после закрытия.
 */
const PENDING_PAYMENT_STORAGE_KEY = "gitorg_pending_payment_id_v1";

/** @param {string} paymentId */
export function rememberPendingPaymentId(paymentId) {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, String(paymentId));
  } catch (error) {
    // Приватный режим или заблокированное хранилище — статус просто добьётся
    // уведомлением от банка, а страница покажет обычный баланс.
    reportClientIssue("pendingPaymentStorage#1", error);
  }
}

/** @returns {string} */
export function readPendingPaymentId() {
  try {
    return sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function forgetPendingPaymentId() {
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
  } catch (error) {
    // См. выше: нечего чистить — и ладно.
    reportClientIssue("pendingPaymentStorage#2", error);
  }
}
