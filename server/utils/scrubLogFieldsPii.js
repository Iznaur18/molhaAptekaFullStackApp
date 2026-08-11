const REDACTED = "[Filtered]";

/** Ключи, значения которых никогда не пишем в ops-логи. */
const SENSITIVE_KEY_PATTERN =
  /^(authorization|cookie|set-cookie|password|passwd|token|accessToken|refreshToken|secret|apiKey|api_key|x-api-key|jwt|otp|phone|email|passport|inn)$/i;

/**
 * @param {unknown} value
 * @param {number} depth
 * @returns {unknown}
 */
function scrubValue(value, depth) {
  if (depth > 6) {
    return "[Truncated]";
  }
  if (value == null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1));
  }
  if (typeof value === "object") {
    return scrubLogFieldsPii(/** @type {Record<string, unknown>} */ (value), depth + 1);
  }
  return String(value);
}

/**
 * Рекурсивно маскирует чувствительные поля перед JSON-логом.
 * Не трогает `event` / `level` / `time` / `requestId` / `jobId` / `message` / `stack`.
 *
 * @param {Record<string, unknown>} fields
 * @param {number} [depth]
 * @returns {Record<string, unknown>}
 */
export function scrubLogFieldsPii(fields, depth = 0) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = scrubValue(value, depth);
  }
  return out;
}
