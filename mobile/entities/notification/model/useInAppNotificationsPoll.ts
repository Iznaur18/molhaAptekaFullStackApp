import { useQuery } from "@tanstack/react-query";

import { fetchAuthMe } from "@/entities/session/api/fetchAuthMe";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { authMeQueryKeys, getAccessToken } from "@/shared/api";
import { AUTH_ME_STALE_TIME_MS } from "@/shared/config";

export const IN_APP_NOTIFICATIONS_POLL_MS = 30_000;

export const useInAppNotificationsPoll = (): void => {
  const isAuthorized = useIsAuthorized();

  useQuery({
    queryKey: authMeQueryKeys.all,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        return null;
      }
      return fetchAuthMe();
    },
    enabled: isAuthorized,
    staleTime: AUTH_ME_STALE_TIME_MS,
    refetchInterval: isAuthorized ? IN_APP_NOTIFICATIONS_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
};
