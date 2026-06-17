/**
 * Cron должен выполняться ровно на одном процессе при 2+ API-репликах.
 *
 * - `CRON_LEADER=true` — запускать cron (API@1 или `worker.js`)
 * - `CRON_LEADER=false` — не запускать (остальные API-реплики)
 * - unset в dev — запускать (один локальный процесс)
 * - unset в production — не запускать (безопасный дефолт для scale-out)
 */
export function shouldRunCronOnThisProcess() {
  const flag = process.env.CRON_LEADER;
  if (flag === "true") {
    return true;
  }
  if (flag === "false") {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}
