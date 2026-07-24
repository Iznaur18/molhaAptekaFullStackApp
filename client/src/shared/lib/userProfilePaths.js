/**
 * SPA-страница чужого профиля: `/user/:userId` (Mongo ObjectId).
 * API тот же URL (`GET /user/:id`) — document navigation (Accept: text/html)
 * отдаёт SPA; XHR остаётся на Express (см. vite bypass / nginx).
 */

/** Только 24 hex — как `mongoIdSchema` в `@molha/api-contract`. */
const USER_PROFILE_SPA_PATH_RE = /^\/user\/([a-f\d]{24})$/i;

/**
 * @param {string} pathname
 * @returns {string | null}
 */
export function parseUserIdFromProfilePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = normalized.match(USER_PROFILE_SPA_PATH_RE);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * @param {string} pathname
 */
export function isUserProfileSpaPath(pathname) {
  return parseUserIdFromProfilePathname(pathname) != null;
}

/**
 * @param {string | number | null | undefined} userId
 * @returns {string | null}
 */
export function buildUserProfilePath(userId) {
  const id = userId != null ? String(userId).trim() : "";
  if (!id) {
    return null;
  }
  return `/user/${encodeURIComponent(id)}`;
}

/**
 * Document navigation → SPA; API client → proxy.
 * @param {string | undefined} acceptHeader
 */
export function isHtmlDocumentAccept(acceptHeader) {
  const primary = String(acceptHeader ?? "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  return Boolean(primary?.startsWith("text/html"));
}

/**
 * @param {string} pathname
 * @param {string | undefined} acceptHeader
 */
export function shouldServeUserProfileAsSpa(pathname, acceptHeader) {
  return isUserProfileSpaPath(pathname) && isHtmlDocumentAccept(acceptHeader);
}
