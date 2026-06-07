import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markInAppNotificationsRead } from "../api/markInAppNotificationsRead.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";

export function useMarkInAppNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInAppNotificationsRead,
    onSuccess: () => {
      queryClient.setQueryData(authMeQueryKeys.all, (old) => {
        if (!old) {
          return old;
        }
        return { ...old, inAppNotifications: [] };
      });
    },
  });
}
