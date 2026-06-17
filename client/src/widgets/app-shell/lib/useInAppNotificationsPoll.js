import { useQuery } from "@tanstack/react-query";

import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { authMeQueryKeys } from "../../../entities/user/model/authMeQueryKeys.js";
import { AUTH_ME_STALE_TIME_MS } from "../../../shared/api/queryClient.js";

export const IN_APP_NOTIFICATIONS_POLL_MS = 30_000;

/**
 * @param {{
 *   isAuthorized: boolean;
 *   mainView: string;
 * }} params
 */
export function useInAppNotificationsPoll({ isAuthorized, mainView }) {
  const pollEnabled = isAuthorized && mainView !== "notifications";

  useQuery({
    queryKey: authMeQueryKeys.all,
    queryFn: fetchCurrentUserProfile,
    enabled: pollEnabled,
    staleTime: AUTH_ME_STALE_TIME_MS,
    refetchInterval: pollEnabled ? IN_APP_NOTIFICATIONS_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
}
