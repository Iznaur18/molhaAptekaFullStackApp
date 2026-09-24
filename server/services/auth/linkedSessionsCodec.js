import { AUTH_LINKED_ACCOUNTS_MAX } from "@molha/api-contract";

/** Сохранённых (неактивных) аккаунтов на один меньше лимита: одно место — активный. */
export const LINKED_SESSIONS_MAX_ENTRIES = AUTH_LINKED_ACCOUNTS_MAX - 1;

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
/** JWT = base64url-части через точку; запятая и двоеточие в нём не встречаются. */
const JWT_RE = /^[\w-]+\.[\w-]+\.[\w-]+$/;

/**
 * @typedef {{ userId: string; refreshToken: string | null }} LinkedSessionEntry
 */

/**
 * Разбор cookie `linked_sessions`: `userId:refreshJwt` через запятую, у персонала
 * токен пустой. Битые записи и дубли молча отбрасываются — cookie может быть
 * подделана или устареть, это не повод ронять запрос.
 *
 * @param {string} raw
 * @returns {LinkedSessionEntry[]}
 */
export function parseLinkedSessions(raw) {
  if (typeof raw !== "string" || !raw) {
    return [];
  }

  /** @type {LinkedSessionEntry[]} */
  const entries = [];
  const seen = new Set();
  for (const chunk of raw.split(",")) {
    const separatorIndex = chunk.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const userId = chunk.slice(0, separatorIndex).toLowerCase();
    const token = chunk.slice(separatorIndex + 1);
    if (!OBJECT_ID_RE.test(userId) || seen.has(userId)) {
      continue;
    }
    if (token && !JWT_RE.test(token)) {
      continue;
    }
    seen.add(userId);
    entries.push({ userId, refreshToken: token || null });
    if (entries.length >= LINKED_SESSIONS_MAX_ENTRIES) {
      break;
    }
  }
  return entries;
}

/**
 * @param {LinkedSessionEntry[]} entries
 * @returns {string}
 */
export function serializeLinkedSessions(entries) {
  return entries
    .slice(0, LINKED_SESSIONS_MAX_ENTRIES)
    .map((entry) => `${entry.userId}:${entry.refreshToken ?? ""}`)
    .join(",");
}

/**
 * Кладёт запись первой (самый свежий аккаунт — наверху списка), убирая старую
 * запись того же пользователя.
 *
 * @param {LinkedSessionEntry[]} entries
 * @param {LinkedSessionEntry} entry
 * @returns {LinkedSessionEntry[]}
 */
export function upsertLinkedSession(entries, entry) {
  return [entry, ...withoutLinkedSession(entries, entry.userId)];
}

/**
 * @param {LinkedSessionEntry[]} entries
 * @param {string} userId
 * @returns {LinkedSessionEntry[]}
 */
export function withoutLinkedSession(entries, userId) {
  const normalized = String(userId).toLowerCase();
  return entries.filter((entry) => entry.userId !== normalized);
}
