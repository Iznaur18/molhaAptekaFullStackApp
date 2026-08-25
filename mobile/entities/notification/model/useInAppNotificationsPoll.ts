import { useQuery } from "@tanstack/react-query";

import { resolveAuthSessionQueryData } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { authMeQueryKeys } from "@/shared/api";
import { AUTH_ME_STALE_TIME_MS } from "@/shared/config";

export const IN_APP_NOTIFICATIONS_POLL_MS = 30_000;

export const useInAppNotificationsPoll = (): void => {
  const isAuthorized = useIsAuthorized();

  useQuery({
    queryKey: authMeQueryKeys.all,
    queryFn: resolveAuthSessionQueryData,
    enabled: isAuthorized,
    staleTime: AUTH_ME_STALE_TIME_MS,
    refetchInterval: isAuthorized ? IN_APP_NOTIFICATIONS_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
};
