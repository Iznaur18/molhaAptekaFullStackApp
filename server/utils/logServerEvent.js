import { resolveHttpErrorStatus } from "./resolveHttpErrorStatus.js";
import { scrubLogFieldsPii } from "./scrubLogFieldsPii.js";

const STDERR_LEVELS = new Set(["error", "fatal"]);

/**
 * Поля ошибки для ops-лога (без сырого Error-объекта).
 * @param {unknown} error
 * @returns {{ message: string; stack?: string; code?: string | number }}
 */
export function formatLogError(error) {
  if (error instanceof Error) {
    /** @type {{ message: string; stack?: string; code?: string | number }} */
    const fields = { message: error.message };
    if (error.stack) {
      fields.stack = error.stack;
    }
    const code = /** @type {{ code?: string | number }} */ (error).code;
    if (code != null) {
      fields.code = code;
    }
    return fields;
  }
  return { message: typeof error === "string" ? error : String(error) };
}

/**
 * Одна JSON-строка в stdout/stderr (для journald / Loki / CloudWatch).
 *
 * Контракт полей:
 * - `event` (обязательно): `namespace.snake_case` (например `cron.job_failed`)
 * - корреляция: `requestId` | `jobId` | `workerId` (хотя бы одно на request/job path)
 * - `level` / `time` добавляются здесь
 *
 * @param {'debug' | 'info' | 'warn' | 'error' | 'fatal'} level
 * @param {Record<string, unknown> & { event: string }} fields
 */
export function logServerEvent(level, fields) {
  const { event, ...rest } = fields;
  const scrubbed = scrubLogFieldsPii(rest);
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    event,
    ...scrubbed,
  });

  if (STDERR_LEVELS.has(level)) {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

/**
 * @param {Error & { statusCode?: number; code?: string | number; type?: string; isOperational?: boolean }} err
 * @param {import('express').Request} req
 */
export function logServerHttpError(err, req) {
  const statusCode = resolveHttpErrorStatus(err);
  const level = statusCode >= 500 ? "error" : "warn";
  const includeStack = statusCode >= 500 || process.env.NODE_ENV !== "production";

  /** @type {Record<string, unknown> & { event: string }} */
  const fields = {
    event: "http_error",
    requestId: req.requestId ?? null,
    statusCode,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    errorName: err.name,
    message: err.message,
  };

  if (err.code != null) {
    fields.code = err.code;
  }
  if (typeof err.isOperational === "boolean") {
    fields.operational = err.isOperational;
  }
  if (includeStack && err.stack) {
    fields.stack = err.stack;
  }

  logServerEvent(level, fields);
}
