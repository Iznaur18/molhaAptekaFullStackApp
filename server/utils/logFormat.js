/**
 * Формат ops-логов.
 * - `json` — одна JSON-строка (prod / journald / Loki)
 * - `pretty` — читаемая строка для терминала в dev
 *
 * Env `LOG_FORMAT=json|pretty`. Если не задан: development → pretty, иначе json.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {'json' | 'pretty'}
 */
export function resolveLogFormat(env = process.env) {
  const raw = String(env.LOG_FORMAT ?? "")
    .trim()
    .toLowerCase();
  if (raw === "json" || raw === "pretty") {
    return raw;
  }
  if (env.NODE_ENV === "development") {
    return "pretty";
  }
  return "json";
}

/**
 * @param {unknown} value
 * @returns {string}
 */
const formatExtraValue = (value) => {
  if (value == null) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Человекочитаемая строка для терминала.
 *
 * @param {'debug' | 'info' | 'warn' | 'error' | 'fatal'} level
 * @param {Record<string, unknown> & { event: string }} fields
 * @param {Date} [now]
 * @returns {string}
 */
export function formatPrettyServerLogLine(level, fields, now = new Date()) {
  const time = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const event = String(fields.event ?? "");

  if (event === "http.access") {
    const method = String(fields.method ?? "?");
    const path = String(fields.path ?? "?");
    const statusCode = fields.statusCode ?? "?";
    const latencyMs = fields.latencyMs ?? "?";
    return `${time}  ${method} ${path} → ${statusCode}  (${latencyMs}ms)`;
  }

  if (event === "http_error") {
    const parts = [
      time,
      level.toUpperCase(),
      `${fields.method ?? "?"} ${fields.path ?? "?"} → ${fields.statusCode ?? "?"}`,
    ];
    if (fields.ip) {
      parts.push(`ip=${fields.ip}`);
    }
    if (fields.message) {
      parts.push(String(fields.message));
    }
    return parts.join("  ");
  }

  const skipKeys = new Set(["event", "stack", "sampled"]);
  const extras = Object.entries(fields)
    .filter(([key, value]) => !skipKeys.has(key) && value != null && value !== "")
    .map(([key, value]) => `${key}=${formatExtraValue(value)}`)
    .join("  ");

  const levelLabel = level === "info" ? "" : `${level.toUpperCase()}  `;
  return `${time}  ${levelLabel}${event}${extras ? `  ${extras}` : ""}`;
}
