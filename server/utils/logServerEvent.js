import { resolveHttpErrorStatus } from "./resolveHttpErrorStatus.js";

const STDERR_LEVELS = new Set(["error", "fatal"]);

/**
 * Одна JSON-строка в stdout/stderr (для journald / Loki / CloudWatch).
 * @param {'debug' | 'info' | 'warn' | 'error' | 'fatal'} level
 * @param {Record<string, unknown>} fields
 */
export function logServerEvent(level, fields) {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    ...fields,
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
  const includeStack =
    statusCode >= 500 || process.env.NODE_ENV !== "production";

  /** @type {Record<string, unknown>} */
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
