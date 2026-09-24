import {
  clearLinkedSessionsCookie,
  getLinkedSessionsCookie,
  setLinkedSessionsCookie,
} from "../../utils/authCookie.js";
import { recordAccountDeviceLinks } from "./accountDeviceLinks.js";
import {
  parseLinkedSessions,
  serializeLinkedSessions,
  withoutLinkedSession,
} from "./linkedSessionsCodec.js";

/** Флаг в res.locals: cookie сохранённых аккаунтов уже записал вызывающий код. */
export const LINKED_SESSIONS_HANDLED_LOCAL = "linkedSessionsHandled";

/**
 * @param {import('express').Response} res
 * @param {import('./linkedSessionsCodec.js').LinkedSessionEntry[]} entries
 */
export function writeLinkedSessions(res, entries) {
  if (entries.length === 0) {
    clearLinkedSessionsCookie(res);
  } else {
    setLinkedSessionsCookie(res, serializeLinkedSessions(entries));
  }
  if (res.locals) {
    res.locals[LINKED_SESSIONS_HANDLED_LOCAL] = true;
  }
}

/**
 * Вход в аккаунт, который уже лежит среди сохранённых (например, «войти
 * заново» после отзыва сессии): убираем его из списка — он теперь активный.
 * Заодно отмечаем связь с остальными аккаунтами браузера.
 *
 * @param {import('express').Request | null | undefined} req
 * @param {import('express').Response} res
 * @param {string} userId
 * @param {{ recordLinks: boolean }} options
 */
export function syncLinkedSessionsOnLogin(req, res, userId, { recordLinks }) {
  if (!req || res.locals?.[LINKED_SESSIONS_HANDLED_LOCAL]) {
    return;
  }
  const entries = parseLinkedSessions(getLinkedSessionsCookie(req));
  if (entries.length === 0) {
    return;
  }

  const remaining = withoutLinkedSession(entries, userId);
  if (remaining.length !== entries.length) {
    writeLinkedSessions(res, remaining);
  }
  if (recordLinks) {
    recordAccountDeviceLinks(
      userId,
      remaining.map((entry) => entry.userId),
    );
  }
}
