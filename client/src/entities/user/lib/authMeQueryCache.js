import { authMeQueryKeys } from "../model/authMeQueryKeys.js";

/** @typedef {import('../api/fetchCurrentUserProfile.js').AuthMeData | null} AuthMeCacheData */

const AUTH_ME_QUERY_FILTER = { queryKey: authMeQueryKeys.all, exact: true };

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {AuthMeCacheData} data
 */
const patchAuthMeQueryState = (queryClient, data) => {
  queryClient.setQueryData(authMeQueryKeys.all, data);

  const cachedQuery = queryClient.getQueryCache().find(AUTH_ME_QUERY_FILTER);
  if (!cachedQuery) {
    return;
  }

  cachedQuery.setState({
    data,
    error: null,
    status: "success",
    fetchStatus: "idle",
    dataUpdatedAt: Date.now(),
  });
};

/**
 * Кладёт /auth/me в кэш и сбрасывает stale error (иначе useEffect снова вызовет logout).
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {AuthMeCacheData} data
 */
export const hydrateAuthMeCache = (queryClient, data) => {
  patchAuthMeQueryState(queryClient, data);
};

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export const clearAuthMeCache = (queryClient) => {
  patchAuthMeQueryState(queryClient, null);
};
