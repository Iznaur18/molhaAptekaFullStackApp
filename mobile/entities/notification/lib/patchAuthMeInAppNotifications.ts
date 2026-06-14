import type { QueryClient } from "@tanstack/react-query";

import { authMeQueryKeys } from "@/shared/api";

import type { InAppNotification } from "../model/useInAppNotifications";

export const patchAuthMeInAppNotifications = (
  queryClient: QueryClient,
  notifications: InAppNotification[],
): void => {
  queryClient.setQueryData(authMeQueryKeys.all, (old) => {
    if (!old || typeof old !== "object") {
      return old;
    }
    return {
      ...old,
      inAppNotifications: notifications,
    };
  });
};
