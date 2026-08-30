import { randomBytes } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  ONEC_EXCHANGE_COOKIE_NAME,
  ONEC_EXCHANGE_SESSION_TTL_SECONDS,
} from "../../../constants/onecExchangeConstants.js";
import OneCExchangeSessionModel, {
  buildOneCExchangeSessionExpiry,
} from "../../../models/OneCExchangeSessionModel.js";
import { formatLogError, logServerEvent } from "../../../utils/logServerEvent.js";
import { safeEqual } from "./onecExchangeCredentials.js";

/** Корень временных папок обмена. Переживает рестарт, чистится по TTL сессии. */
export const ONEC_EXCHANGE_TMP_ROOT =
  process.env.ONEC_EXCHANGE_TMP_DIR?.trim() ||
  path.join(tmpdir(), "izibuy-1c-exchange");

/**
 * @param {string} sessionId
 */
export function buildOneCExchangeSessionDir(sessionId) {
  return path.join(ONEC_EXCHANGE_TMP_ROOT, sessionId);
}

/**
 * @param {{ sellerId: string; login: string; type: string; remoteIp?: string }} params
 */
export async function createOneCExchangeSession({
  sellerId,
  login,
  type,
  remoteIp = "",
}) {
  const sessionId = randomBytes(24).toString("hex");
  const uploadDir = buildOneCExchangeSessionDir(sessionId);
  await mkdir(uploadDir, { recursive: true });

  const session = await OneCExchangeSessionModel.create({
    sessionId,
    sellerId,
    login,
    type,
    uploadDir,
    files: [],
    totalBytes: 0,
    remoteIp: String(remoteIp).slice(0, 64),
    expiresAt: buildOneCExchangeSessionExpiry(),
  });

  return session;
}

/**
 * Cookie парсим сами: роутер обмена смонтирован до `cookie-parser`, чтобы
 * бинарный POST от 1С не проходил через `express.json` и CSRF-гейт сайта.
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
export function readOneCExchangeCookie(req) {
  const header = req.headers?.cookie;
  if (typeof header !== "string" || !header) return "";
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name !== ONEC_EXCHANGE_COOKIE_NAME) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return "";
}

/**
 * 1С шлёт cookie не всегда (часть конфигураций отдаёт значение в параметре
 * `sessid`), поэтому смотрим оба источника.
 *
 * @param {import('express').Request} req
 */
export function resolveOneCExchangeSessionId(req) {
  const fromCookie = readOneCExchangeCookie(req);
  if (fromCookie) return fromCookie;
  const fromQuery = req.query?.sessid ?? req.query?.sessionId;
  return typeof fromQuery === "string" ? fromQuery.trim() : "";
}

/**
 * @param {import('express').Request} req
 * @param {string} expectedType
 * @returns {Promise<import('mongoose').HydratedDocument<any> | null>}
 */
export async function resolveOneCExchangeSession(req, expectedType) {
  const sessionId = resolveOneCExchangeSessionId(req);
  if (!sessionId) return null;

  const session = await OneCExchangeSessionModel.findOne({ sessionId });
  if (!session) return null;
  if (!safeEqual(session.sessionId, sessionId)) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  if (expectedType && session.type !== expectedType) return null;

  return session;
}

/**
 * @param {import('mongoose').HydratedDocument<any>} session
 */
export async function touchOneCExchangeSession(session) {
  session.expiresAt = buildOneCExchangeSessionExpiry();
  await session.save();
}

/**
 * @param {import('express').Response} res
 * @param {string} sessionId
 */
export function setOneCExchangeCookie(res, sessionId) {
  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    `${ONEC_EXCHANGE_COOKIE_NAME}=${sessionId}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ONEC_EXCHANGE_SESSION_TTL_SECONDS}`,
  ];
  if (isProduction) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

/**
 * Удалить сессию вместе с временными файлами.
 *
 * @param {import('mongoose').HydratedDocument<any> | { sessionId: string; uploadDir?: string }} session
 */
export async function destroyOneCExchangeSession(session) {
  const uploadDir =
    session.uploadDir || buildOneCExchangeSessionDir(session.sessionId);
  try {
    await rm(uploadDir, { recursive: true, force: true });
  } catch (error) {
    logServerEvent("warn", {
      event: "onec.exchange_tmp_cleanup_failed",
      sessionId: session.sessionId,
      ...formatLogError(error),
    });
  }
  await OneCExchangeSessionModel.deleteOne({ sessionId: session.sessionId });
}

/**
 * Подчистить папки брошенных сессий: TTL-индекс Mongo удаляет документ, но не
 * файлы на диске. Вызывается из cron-задачи 1С.
 */
export async function purgeExpiredOneCExchangeDirs() {
  const { readdir, stat } = await import("node:fs/promises");
  let entries;
  try {
    entries = await readdir(ONEC_EXCHANGE_TMP_ROOT);
  } catch {
    return { removed: 0 };
  }

  const alive = new Set(
    (
      await OneCExchangeSessionModel.find({}).select("sessionId").lean()
    ).map((row) => row.sessionId),
  );
  const staleBefore = Date.now() - ONEC_EXCHANGE_SESSION_TTL_SECONDS * 1000;
  let removed = 0;

  for (const entry of entries) {
    if (alive.has(entry)) continue;
    const dir = path.join(ONEC_EXCHANGE_TMP_ROOT, entry);
    try {
      // Свежая папка без документа — сессия ещё создаётся, не трогаем.
      const info = await stat(dir);
      if (info.mtimeMs > staleBefore) continue;
      await rm(dir, { recursive: true, force: true });
      removed += 1;
    } catch (error) {
      logServerEvent("warn", {
        event: "onec.exchange_tmp_purge_failed",
        dir,
        ...formatLogError(error),
      });
    }
  }

  return { removed };
}
