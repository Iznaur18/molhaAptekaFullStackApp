import {
  OPS_ALERT_SEVERITY_CRITICAL,
  OPS_ALERT_SEVERITY_WARNING,
} from "./opsAlertConfig.js";

/**
 * События `logServerEvent`, о которых дежурный узнаёт сразу. Остальные
 * ошибки видны в журнале и Sentry. Уровень `fatal` уходит всегда как critical.
 *
 * critical — деньги, падение процесса, база: реагировать в любое время.
 * warning — фоновые задачи и интеграции: реагировать в рабочий день.
 *
 * @type {ReadonlyMap<string, typeof OPS_ALERT_SEVERITY_CRITICAL | typeof OPS_ALERT_SEVERITY_WARNING>}
 */
export const OPS_ALERT_EVENTS = new Map([
  // Деньги: списали, но не зачли, или суммы разошлись с провайдером.
  ["payment.amount_mismatch", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.open_amount_mismatch", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.receipt_total_mismatch", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.credit_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.order_mark_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.order_mark_reset_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.service_activation_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["payment.service_handler_missing", OPS_ALERT_SEVERITY_CRITICAL],
  ["escrow_auto_release_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["confirmorderitembybuyer_transaction", OPS_ALERT_SEVERITY_CRITICAL],
  ["money.loyalty_release_batch_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["money.order_finalize_offers_failed", OPS_ALERT_SEVERITY_CRITICAL],

  // Процесс и база.
  ["process.uncaught_exception", OPS_ALERT_SEVERITY_CRITICAL],
  ["process.unhandled_rejection", OPS_ALERT_SEVERITY_CRITICAL],
  ["api.startup_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["api.listen_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["api.prod_env_invalid", OPS_ALERT_SEVERITY_CRITICAL],
  ["indexes_sync_failed", OPS_ALERT_SEVERITY_CRITICAL],
  ["mongo.read_connection_error", OPS_ALERT_SEVERITY_CRITICAL],

  // Фоновые задачи и интеграции.
  ["cron.job_failed", OPS_ALERT_SEVERITY_WARNING],
  ["bullmq.job_failed", OPS_ALERT_SEVERITY_WARNING],
  ["bullmq.redis_error", OPS_ALERT_SEVERITY_WARNING],
  ["rate_limit_redis_error", OPS_ALERT_SEVERITY_WARNING],
  ["onec.commerceml_import_failed", OPS_ALERT_SEVERITY_WARNING],
  ["onec.cron_seller_sync_failed", OPS_ALERT_SEVERITY_WARNING],
  ["notify_payment_confirmed_failed", OPS_ALERT_SEVERITY_WARNING],
  ["object_storage.health_failed", OPS_ALERT_SEVERITY_WARNING],
]);

/**
 * @param {string} level
 * @param {string} event
 * @returns {typeof OPS_ALERT_SEVERITY_CRITICAL | typeof OPS_ALERT_SEVERITY_WARNING | null}
 */
export function resolveOpsAlertSeverity(level, event) {
  if (level === "fatal") {
    return OPS_ALERT_SEVERITY_CRITICAL;
  }
  return OPS_ALERT_EVENTS.get(event) ?? null;
}
