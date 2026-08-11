import { logServerEvent } from "../utils/logServerEvent.js";
import {
  resolveAccessLogSampleRate,
  shouldSampleAccessLog,
  shouldSkipAccessLogPath,
} from "../utils/accessLogPolicy.js";

/**
 * JSON access-лог: method/path/status/latencyMs/requestId.
 * Сэмплинг успешных; status >= 400 всегда (если middleware включён).
 * Выкл: ACCESS_LOG_SAMPLE_RATE=0 (в test по умолчанию выкл).
 *
 * @type {import('express').RequestHandler}
 */
export function accessLogMW(req, res, next) {
  const sampleRate = resolveAccessLogSampleRate();
  if (sampleRate <= 0) {
    return next();
  }

  if (shouldSkipAccessLogPath(req.path)) {
    return next();
  }

  const startedAt = Date.now();
  const method = req.method;
  const path = req.path;
  const requestId = req.requestId ?? null;

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const forceLog = statusCode >= 400;
    if (!forceLog && !shouldSampleAccessLog(sampleRate)) {
      return;
    }

    logServerEvent("info", {
      event: "http.access",
      requestId,
      method,
      path,
      statusCode,
      latencyMs: Date.now() - startedAt,
      sampled: !forceLog,
    });
  });

  return next();
}
