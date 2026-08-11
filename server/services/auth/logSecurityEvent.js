import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Ops-события безопасности (`security.*`). Без email/phone/token в полях.
 *
 * @param {'info' | 'warn' | 'error'} level
 * @param {string} action snake_case без префикса security.
 * @param {Record<string, unknown>} [fields]
 */
export function logSecurityEvent(level, action, fields = {}) {
  logServerEvent(level, {
    event: `security.${action}`,
    ...fields,
  });
}

/**
 * @param {import('express').Request} req
 * @returns {Record<string, unknown>}
 */
export function securityRequestFields(req) {
  return {
    requestId: req.requestId ?? null,
    method: req.method,
    path: req.path || req.originalUrl || null,
    ip: req.ip ?? null,
  };
}

/**
 * @param {string} action
 * @param {Record<string, unknown>} fields
 * @param {unknown} error
 */
export function logSecurityFailure(action, fields, error) {
  logSecurityEvent("error", `${action}_failed`, {
    ...fields,
    ...formatLogError(error),
  });
}
