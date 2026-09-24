import { useQuery } from "@tanstack/react-query";

import { fetchCurrentUserProfile } from "../api/fetchCurrentUserProfile.js";
import { fetchLinkedAccounts } from "../api/linkedAccountsApi.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";
import { linkedAccountsQueryKeys } from "./linkedAccountsQueryKeys.js";

/**
 * Текущий пользователь из уже загруженного /auth/me — только подписка на
 * кэш, без собственного запроса (enabled: false).
 */
function useCachedAuthUserId() {
  const { data } = useQuery({
    queryKey: authMeQueryKeys.all,
    queryFn: fetchCurrentUserProfile,
    enabled: false,
    select: (authMe) => (authMe?.user?._id ? String(authMe.user._id) : null),
  });
  return data ?? null;
}

/**
 * Список привязан к текущему аккаунту: вход после «Добавить аккаунт» идёт
 * без перезагрузки страницы, и без этого профиль показывал список, снятый
 * ещё гостем на странице входа (нет текущего, «Нужно войти снова»).
 *
 * @param {{ enabled?: boolean }} [opts]
 */
export function useLinkedAccountsQuery({ enabled = true } = {}) {
  const activeUserId = useCachedAuthUserId();
  return useQuery({
    queryKey: linkedAccountsQueryKeys.forActive(activeUserId),
    queryFn: fetchLinkedAccounts,
    enabled,
    staleTime: 30_000,
  });
}
