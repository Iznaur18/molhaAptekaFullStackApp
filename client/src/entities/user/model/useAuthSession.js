import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchCurrentUserProfile } from "../api/fetchCurrentUserProfile.js";
import { isPremiumActive } from "../lib/isPremiumActive.js";
import { AUTH_ME_STALE_TIME_MS } from "../../../shared/api/queryClient.js";
import { clearDeadAuthSession } from "../../../shared/api/apiClient.js";
import {
  clearAuthMeCache,
} from "../lib/authMeQueryCache.js";
import { subscribeAuthSessionDead } from "../../../shared/lib/authSessionEvents.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";

/** @typedef {import('../model/types.js').UserPublicProfile} UserPublicProfile */

/**
 * @param {Partial<UserPublicProfile>} updates
 */
function mergeAuthMeUser(updates) {
  return (
    /** @param {import('../api/fetchCurrentUserProfile.js').AuthMeData | undefined} old */
    (old) => {
      if (!old?.user) {
        return old;
      }
      return {
        ...old,
        user: { ...old.user, ...updates },
      };
    }
  );
}

export function useAuthSession() {
  const queryClient = useQueryClient();
  const [fetchAllowed, setFetchAllowed] = useState(true);

  const query = useQuery({
    queryKey: authMeQueryKeys.all,
    queryFn: fetchCurrentUserProfile,
    enabled: fetchAllowed,
    retry: false,
    staleTime: AUTH_ME_STALE_TIME_MS,
    refetchOnMount: "always",
  });

  const user = query.isSuccess ? (query.data?.user ?? null) : null;
  const isAuthReady = query.isFetched || !fetchAllowed;
  const isAuthorized = Boolean(user);
  const isSessionReady = isAuthReady;

  useEffect(() => {
    if (!query.isError || user) {
      return;
    }
    void clearDeadAuthSession();
  }, [query.isError, user]);

  useEffect(() => subscribeAuthSessionDead(() => clearAuthMeCache(queryClient)), [queryClient]);

  const patchAuthMeUser = useCallback(
    /** @param {Partial<UserPublicProfile>} updates */
    (updates) => {
      queryClient.setQueryData(authMeQueryKeys.all, mergeAuthMeUser(updates));
    },
    [queryClient],
  );

  const patchAuthMeNotifications = useCallback(
    /** @param {import('../../product-report/model/types.js').UserInAppNotification[]} notifications */
    (notifications) => {
      queryClient.setQueryData(authMeQueryKeys.all, (old) => {
        if (!old) {
          return old;
        }
        return { ...old, inAppNotifications: notifications };
      });
    },
    [queryClient],
  );

  const invalidateAuthMe = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
  }, [queryClient]);

  const clearAuthSession = useCallback(() => {
    setFetchAllowed(true);
    clearAuthMeCache(queryClient);
    void clearDeadAuthSession();
  }, [queryClient]);

  const setIsAuthorized = useCallback(
    /** @param {boolean} value */
    (value) => {
      if (value) {
        setFetchAllowed(true);
        const cached = queryClient.getQueryData(authMeQueryKeys.all);
        if (!cached?.user) {
          void invalidateAuthMe();
        }
      } else {
        clearAuthSession();
      }
    },
    [clearAuthSession, invalidateAuthMe, queryClient],
  );

  const setLoyaltyPoints = useCallback(
    /** @param {number} value */
    (value) => {
      patchAuthMeUser({ userLoyaltyPoints: value });
    },
    [patchAuthMeUser],
  );

  const setLoyaltyPointsReserved = useCallback(
    /** @param {number} value */
    (value) => {
      patchAuthMeUser({ userLoyaltyPointsReserved: value });
    },
    [patchAuthMeUser],
  );

  const setIsPremiumUser = useCallback(
    /** @param {boolean} value */
    (value) => {
      // При включении сбрасываем дату окончания в null («активен, точный срок —
      // после ближайшего refetch»), чтобы isPremiumActive сразу видел премиум и
      // не опирался на устаревшую (возможно, прошедшую) дату в кэше.
      patchAuthMeUser(
        value ? { isPremiumUser: true, premiumExpiresAt: null } : { isPremiumUser: false },
      );
    },
    [patchAuthMeUser],
  );

  const setIsEmailVerified = useCallback(
    /** @param {boolean} value */
    (value) => {
      patchAuthMeUser({ isEmailVerified: value });
    },
    [patchAuthMeUser],
  );

  const setCurrentUserId = useCallback(
    /** @param {string | null} userId */
    (userId) => {
      if (userId === null) {
        clearAuthSession();
        return;
      }
      patchAuthMeUser({ _id: userId });
    },
    [clearAuthSession, patchAuthMeUser],
  );

  return {
    query,
    user,
    isAuthReady,
    isAuthorized,
    isSessionReady,
    setIsAuthorized,
    clearAuthSession,
    invalidateAuthMe,
    patchAuthMeUser,
    patchAuthMeNotifications,
    currentUserId: user ? String(user._id) : null,
    currentUserRole: user?.userRole ?? null,
    isPremiumUser: isPremiumActive(user),
    isEmailVerified: user ? user.isEmailVerified !== false : true,
    currentUserEmail: user ? String(user.email ?? "").trim() : "",
    loyaltyPoints: user ? Number(user.userLoyaltyPoints) || 0 : 0,
    loyaltyPointsReserved: user ? Number(user.userLoyaltyPointsReserved) || 0 : 0,
    inAppNotifications: query.data?.inAppNotifications ?? [],
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setIsPremiumUser,
    setIsEmailVerified,
    setCurrentUserId,
  };
}
