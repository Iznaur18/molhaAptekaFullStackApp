import { apiClient } from "../../../shared/api/index.js";
import {
  markAuthSessionDead,
  resetAuthSessionState,
} from "../../../shared/api/apiClient.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { parseAuthMeData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI, LOGIN_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { emitAuthSessionDead } from "../../../shared/lib/authSessionEvents.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * Текущий авторизованный пользователь: `GET /auth/me`.
 * Без сессии сервер отвечает 200 и `user: null` (без лишнего refresh).
 *
 * @returns {Promise<{
 *   user: import('../model/types.js').UserPublicProfile;
 *   inAppNotifications: import('../../product-report/model/types.js').UserInAppNotification[];
 * } | null>}
 */
/** Проверяет, что httpOnly cookie сессии реально работают. */
export async function establishAuthSession() {
  return fetchCurrentUserProfile();
}

export async function fetchCurrentUserProfile() {
  try {
    const { data } = await apiClient.get("/auth/me");

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const parsed = parseAuthMeData(data);
    if (!parsed.user) {
      return null;
    }

    resetAuthSessionState();
    return parsed;
  } catch (e) {
    if (e?.response?.status === 401) {
      markAuthSessionDead();
      clearDevAuthTokens();
      emitAuthSessionDead();
      return null;
    }

    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.FETCH_ME_FALLBACK));
  }
}

/**
 * @param {Awaited<ReturnType<typeof fetchCurrentUserProfile>>} profile
 */
export function assertAuthenticatedProfile(profile) {
  if (!profile?.user) {
    throw new Error(LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK);
  }
  return profile;
}
