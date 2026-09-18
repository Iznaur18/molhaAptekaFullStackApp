import os from "node:os";
import path from "node:path";

/** Повтор одного и того же алерта не чаще раза в 15 минут. */
export const OPS_ALERT_DEDUPE_MS = 15 * 60_000;

/** Telegram не должен задерживать обработку запроса. */
export const OPS_ALERT_SEND_TIMEOUT_MS = 5_000;

/** Лимит Telegram — 4096 символов; оставляем запас под заголовок. */
export const OPS_ALERT_TEXT_MAX_LENGTH = 3_500;

/** Длинные значения полей обрезаются: в чат нужна суть, детали — в journalctl. */
export const OPS_ALERT_FIELD_MAX_LENGTH = 200;

/** Сколько полей события показывать в сообщении. */
export const OPS_ALERT_MAX_FIELDS = 10;

export const OPS_ALERT_SEVERITY_CRITICAL = "critical";
export const OPS_ALERT_SEVERITY_WARNING = "warning";

/**
 * Без токена или чата алерты выключены: локально и в тестах ничего не уходит.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ token: string; chatId: string } | null}
 */
export function resolveOpsAlertTelegramConfig(env = process.env) {
  const token = String(env.OPS_ALERT_TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = String(env.OPS_ALERT_TELEGRAM_CHAT_ID ?? "").trim();
  if (!token || !chatId) {
    return null;
  }
  return { token, chatId };
}

/**
 * Откуда алерт: хост и процесс (index.js — API, worker.js — воркер).
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function resolveOpsAlertSource(env = process.env) {
  const explicit = String(env.OPS_ALERT_SOURCE ?? "").trim();
  if (explicit) {
    return explicit;
  }
  const entry = path.basename(process.argv[1] ?? "");
  const processName = entry === "worker.js" ? "worker" : "api";
  return `${os.hostname()} · ${processName}`;
}
