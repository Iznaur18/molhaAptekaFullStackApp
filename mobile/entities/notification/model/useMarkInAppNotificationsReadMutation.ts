import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys } from "@/shared/api";
import { getExpoNotificationsModule } from "@/features/push-notifications/lib/expoNotificationsModule";

import {
  markInAppNotificationsRead,
} from "../api/markInAppNotificationsRead";
import { patchAuthMeInAppNotifications } from "../lib/patchAuthMeInAppNotifications";

const clearNativeBadge = async (): Promise<void> => {
  const Notifications = getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await Notifications.setBadgeCountAsync(0);
  } catch {
    // badge unsupported on some devices
  }
};

export const useMarkInAppNotificationsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInAppNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: authMeQueryKeys.all });
      const previous = queryClient.getQueryData(authMeQueryKeys.all);
      patchAuthMeInAppNotifications(queryClient, []);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(authMeQueryKeys.all, context.previous);
      }
    },
    onSuccess: async () => {
      patchAuthMeInAppNotifications(queryClient, []);
      await clearNativeBadge();
      await queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
    },
  });
};
