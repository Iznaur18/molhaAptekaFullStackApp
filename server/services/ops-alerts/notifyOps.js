import {
  OPS_ALERT_DEDUPE_MS,
  OPS_ALERT_FIELD_MAX_LENGTH,
  OPS_ALERT_MAX_FIELDS,
  OPS_ALERT_SEND_TIMEOUT_MS,
  OPS_ALERT_SEVERITY_CRITICAL,
  OPS_ALERT_TEXT_MAX_LENGTH,
  resolveOpsAlertSource,
  resolveOpsAlertTelegramConfig,
} from "./opsAlertConfig.js";

/** Поля, которые в чат не отправляем: длинные или бесполезные без контекста. */
const OMITTED_FIELDS = new Set(["stack", "level", "time"]);

/** @type {Map<string, { sentAt: number; suppressed: number }>} */
const recentAlerts = new Map();

/**
 * @param {unknown} value
 * @returns {string}
 */
function formatFieldValue(value) {
  const text =
    typeof value === "string" ? value : (JSON.stringify(value) ?? String(value));
  return text.length > OPS_ALERT_FIELD_MAX_LENGTH
    ? `${text.slice(0, OPS_ALERT_FIELD_MAX_LENGTH)}…`
    : text;
}

/**
 * @param {{
 *   severity: string;
 *   title: string;
 *   details?: Record<string, unknown>;
 *   suppressed?: number;
 *   source: string;
 * }} input
 * @returns {string}
 */
export function formatOpsAlertText({
  severity,
  title,
  details = {},
  suppressed = 0,
  source,
}) {
  const icon = severity === OPS_ALERT_SEVERITY_CRITICAL ? "🔴 Критично" : "🟠 Важно";
  const lines = [`${icon} · ${source}`, title];

  const fields = Object.entries(details)
    .filter(([key, value]) => !OMITTED_FIELDS.has(key) && value != null && value !== "")
    .slice(0, OPS_ALERT_MAX_FIELDS);
  for (const [key, value] of fields) {
    lines.push(`${key}: ${formatFieldValue(value)}`);
  }

  if (suppressed > 0) {
    lines.push(`Повторялось ещё ${suppressed} раз за последние 15 минут.`);
  }

  const text = lines.join("\n");
  return text.length > OPS_ALERT_TEXT_MAX_LENGTH
    ? `${text.slice(0, OPS_ALERT_TEXT_MAX_LENGTH)}…`
    : text;
}

/**
 * Отправка алерта дежурному в Telegram. Никогда не бросает: сбой доставки
 * пишется в stderr напрямую, а не через logServerEvent — иначе алерт о
 * неотправленном алерте зациклится.
 *
 * @param {{
 *   severity: string;
 *   key: string;
 *   title: string;
 *   details?: Record<string, unknown>;
 * }} alert
 * @param {{
 *   fetchImpl?: typeof fetch;
 *   now?: () => number;
 *   config?: { token: string; chatId: string } | null;
 *   source?: string;
 * }} [deps]
 * @returns {Promise<{ sent: boolean; reason?: string }>}
 */
export async function notifyOps(alert, deps = {}) {
  const config =
    deps.config === undefined ? resolveOpsAlertTelegramConfig() : deps.config;
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (!config || typeof fetchImpl !== "function") {
    return { sent: false, reason: "disabled" };
  }

  const now = (deps.now ?? Date.now)();
  const previous = recentAlerts.get(alert.key);
  if (previous && now - previous.sentAt < OPS_ALERT_DEDUPE_MS) {
    previous.suppressed += 1;
    return { sent: false, reason: "deduped" };
  }
  recentAlerts.set(alert.key, { sentAt: now, suppressed: 0 });

  const text = formatOpsAlertText({
    severity: alert.severity,
    title: alert.title,
    details: alert.details,
    suppressed: previous?.suppressed ?? 0,
    source: deps.source ?? resolveOpsAlertSource(),
  });

  try {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(OPS_ALERT_SEND_TIMEOUT_MS),
      },
    );
    if (!response.ok) {
      writeDeliveryFailure(`http_${response.status}`);
      return { sent: false, reason: `http_${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    writeDeliveryFailure(error instanceof Error ? error.name : "unknown");
    return { sent: false, reason: "network" };
  }
}

/**
 * @param {string} reason
 */
function writeDeliveryFailure(reason) {
  // eslint-disable-next-line no-console -- logServerEvent здесь зациклил бы алерты
  console.error(
    JSON.stringify({
      level: "warn",
      time: new Date().toISOString(),
      event: "ops_alert.delivery_failed",
      reason,
    }),
  );
}

/** Только для тестов. */
export function resetOpsAlertDedupe() {
  recentAlerts.clear();
}
