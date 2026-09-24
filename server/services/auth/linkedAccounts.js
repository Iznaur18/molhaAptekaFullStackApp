import { AUTH_LINKED_ACCOUNTS_MAX } from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getLinkedSessionsCookie,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { canModerateProductsRole } from "../product/productModeration.js";
import { recordAccountDeviceLinks } from "./accountDeviceLinks.js";
import { verifyRefreshToken } from "./authTokens.js";
import { issueRotatedAuthSession } from "./issueAuthSession.js";
import {
  parseLinkedSessions,
  upsertLinkedSession,
  withoutLinkedSession,
} from "./linkedSessionsCodec.js";
import { writeLinkedSessions } from "./linkedSessionsLogin.js";
import {
  bumpUserAuthTokenVersion,
  isRefreshTokenVersionValid,
} from "./userAuthTokenVersion.js";

const ACCOUNT_USER_FIELDS =
  "userName userAvatarUrl isPremiumUser isUserDataConfirmed userRole isBlockedUser isActiveUser +authTokenVersion";

export const LINKED_ACCOUNTS_LIMIT_MESSAGE = `Можно держать не больше ${AUTH_LINKED_ACCOUNTS_MAX} аккаунтов на одном устройстве`;
export const LINKED_ACCOUNT_REQUIRES_LOGIN_MESSAGE = "Войдите в этот аккаунт заново";

/**
 * @param {string | null | undefined} token
 * @returns {{ _id: string; tv?: number } | null}
 */
function decodeRefreshToken(token) {
  if (!token) {
    return null;
  }
  try {
    return verifyRefreshToken(token);
  } catch {
    // протухший или чужой токен — аккаунт просто потребует входа
    return null;
  }
}

/**
 * Активный аккаунт браузера по refresh-cookie (подпись проверена, без БД).
 *
 * @param {import('express').Request} req
 * @returns {{ userId: string; refreshToken: string; decoded: { _id: string; tv?: number } } | null}
 */
function resolveActiveSession(req) {
  const refreshToken = getRefreshTokenFromRequest(req);
  const decoded = decodeRefreshToken(refreshToken);
  if (!refreshToken || !decoded?._id) {
    return null;
  }
  return { userId: String(decoded._id).toLowerCase(), refreshToken, decoded };
}

/** Аккаунт персонала: без пароля на него не переключаемся. */
const isStaffUser = (user) => canModerateProductsRole(user?.userRole);

/**
 * Можно ли поднять сессию этим токеном прямо сейчас.
 *
 * @param {Record<string, unknown> | null | undefined} user
 * @param {{ _id: string; tv?: number } | null} decoded
 * @param {string} userId
 */
function canResumeSession(user, decoded, userId) {
  return Boolean(
    user &&
    decoded &&
    String(decoded._id).toLowerCase() === userId &&
    isRefreshTokenVersionValid(decoded.tv, user) &&
    !user.isBlockedUser &&
    user.isActiveUser !== false &&
    !isStaffUser(user),
  );
}

/**
 * @param {Record<string, unknown>} user
 * @param {{ isActive: boolean; requiresLogin: boolean }} flags
 */
function toLinkedAccountView(user, { isActive, requiresLogin }) {
  return {
    userId: String(user._id),
    userName: String(user.userName ?? ""),
    userAvatarUrl: typeof user.userAvatarUrl === "string" ? user.userAvatarUrl : null,
    isPremiumUser: user.isPremiumUser === true,
    isUserDataConfirmed: user.isUserDataConfirmed === true,
    isActive,
    requiresLogin,
  };
}

/**
 * @param {string[]} userIds
 * @returns {Promise<Map<string, Record<string, unknown>>>}
 */
async function loadUsersById(userIds) {
  if (userIds.length === 0) {
    return new Map();
  }
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select(ACCOUNT_USER_FIELDS)
    .lean();
  return new Map(users.map((user) => [String(user._id).toLowerCase(), user]));
}

/**
 * `GET /auth/accounts` — активный аккаунт и сохранённые в этом браузере.
 *
 * @param {import('express').Request} req
 */
export async function listLinkedAccounts(req) {
  const active = resolveActiveSession(req);
  const entries = parseLinkedSessions(getLinkedSessionsCookie(req)).filter(
    (entry) => entry.userId !== active?.userId,
  );
  const usersById = await loadUsersById([
    ...(active ? [active.userId] : []),
    ...entries.map((entry) => entry.userId),
  ]);

  const accounts = [];
  const activeUser = active ? usersById.get(active.userId) : null;
  if (activeUser) {
    accounts.push(
      toLinkedAccountView(activeUser, { isActive: true, requiresLogin: false }),
    );
  }
  for (const entry of entries) {
    const user = usersById.get(entry.userId);
    if (!user) {
      continue;
    }
    const decoded = decodeRefreshToken(entry.refreshToken);
    accounts.push(
      toLinkedAccountView(user, {
        isActive: false,
        requiresLogin: !canResumeSession(user, decoded, entry.userId),
      }),
    );
  }

  return { accounts, maxAccounts: AUTH_LINKED_ACCOUNTS_MAX };
}

/**
 * `POST /auth/accounts/stash` — перед входом во второй аккаунт откладываем
 * текущую сессию в список, НЕ отзывая её (в отличие от logout). Дальше любой
 * обычный вход/регистрация выдаёт новую сессию, а старая остаётся в списке.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function stashActiveSession(req, res) {
  const active = resolveActiveSession(req);
  if (!active) {
    throw new AppError(401, "Сначала войдите в аккаунт");
  }
  const user = await UserModel.findById(active.userId)
    .select(ACCOUNT_USER_FIELDS)
    .lean();
  if (!user || !isRefreshTokenVersionValid(active.decoded.tv, user)) {
    throw new AppError(401, "Сессия устарела — войдите заново");
  }

  const entries = withoutLinkedSession(
    parseLinkedSessions(getLinkedSessionsCookie(req)),
    active.userId,
  );
  // Активный + сохранённые уже на пределе: новому аккаунту места нет.
  if (entries.length + 1 >= AUTH_LINKED_ACCOUNTS_MAX) {
    throw new AppError(409, LINKED_ACCOUNTS_LIMIT_MESSAGE);
  }

  writeLinkedSessions(
    res,
    upsertLinkedSession(entries, {
      userId: active.userId,
      refreshToken: isStaffUser(user) ? null : active.refreshToken,
    }),
  );
  clearAuthCookie(res);
  clearRefreshCookie(res);
  recordAccountDeviceLinks(
    active.userId,
    entries.map((entry) => entry.userId),
  );
  return { stashedUserId: active.userId };
}

/**
 * `POST /auth/accounts/switch` — сделать сохранённый аккаунт активным, а
 * текущий отложить в список.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} targetUserId
 */
export async function switchToLinkedAccount(req, res, targetUserId) {
  const targetId = String(targetUserId).toLowerCase();
  const entries = parseLinkedSessions(getLinkedSessionsCookie(req));
  const target = entries.find((entry) => entry.userId === targetId);
  if (!target) {
    throw new AppError(404, "Этого аккаунта нет среди сохранённых на устройстве");
  }

  const active = resolveActiveSession(req);
  const usersById = await loadUsersById([
    targetId,
    ...(active && active.userId !== targetId ? [active.userId] : []),
  ]);
  const targetUser = usersById.get(targetId);
  if (!targetUser) {
    writeLinkedSessions(res, withoutLinkedSession(entries, targetId));
    throw new AppError(404, "Аккаунт удалён");
  }
  if (
    !canResumeSession(targetUser, decodeRefreshToken(target.refreshToken), targetId)
  ) {
    throw new AppError(409, LINKED_ACCOUNT_REQUIRES_LOGIN_MESSAGE);
  }

  let nextEntries = withoutLinkedSession(entries, targetId);
  const activeUser = active ? usersById.get(active.userId) : null;
  if (
    active &&
    activeUser &&
    isRefreshTokenVersionValid(active.decoded.tv, activeUser)
  ) {
    nextEntries = upsertLinkedSession(nextEntries, {
      userId: active.userId,
      refreshToken: isStaffUser(activeUser) ? null : active.refreshToken,
    });
  }

  // Cookie списка пишем ДО выдачи сессии: флаг в res.locals не даст
  // issueAuthSession переписать её по старому значению из запроса.
  writeLinkedSessions(res, nextEntries);
  const data = await issueRotatedAuthSession(targetUser, res, req);
  recordAccountDeviceLinks(
    targetId,
    nextEntries.map((entry) => entry.userId),
  );
  return data;
}

/**
 * `POST /auth/accounts/remove` — убрать аккаунт с этого устройства, не
 * выходя из него на других (сессия не отзывается).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} userId
 */
export function removeLinkedAccount(req, res, userId) {
  const targetId = String(userId).toLowerCase();
  const active = resolveActiveSession(req);
  const removedActive = active?.userId === targetId;
  if (removedActive) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
  }
  writeLinkedSessions(
    res,
    withoutLinkedSession(parseLinkedSessions(getLinkedSessionsCookie(req)), targetId),
  );
  return { removedActive };
}

/**
 * `POST /auth/accounts/logout-all` — выход из всех аккаунтов браузера, как
 * обычный logout для каждого (сессии отзываются и на других устройствах).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function logoutAllLinkedAccounts(req, res) {
  const active = resolveActiveSession(req);
  const userIds = new Set(active ? [active.userId] : []);
  for (const entry of parseLinkedSessions(getLinkedSessionsCookie(req))) {
    // Подписанный токен доказывает, что браузер владел сессией; без токена
    // (персонал) аккаунт и так требует входа — отзывать нечего.
    const decoded = decodeRefreshToken(entry.refreshToken);
    if (decoded && String(decoded._id).toLowerCase() === entry.userId) {
      userIds.add(entry.userId);
    }
  }

  await Promise.all([...userIds].map((userId) => bumpUserAuthTokenVersion(userId)));
  clearAuthCookie(res);
  clearRefreshCookie(res);
  writeLinkedSessions(res, []);
  return { loggedOutCount: userIds.size };
}
