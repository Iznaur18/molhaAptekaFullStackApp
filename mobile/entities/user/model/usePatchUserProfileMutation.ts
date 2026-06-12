import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchUserProfile } from "@/entities/user/api/patchUserProfile";
import { authMeQueryKeys } from "@/shared/api";

export const usePatchUserProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: Record<string, unknown>;
    }) => patchUserProfile(userId, body),
    onSuccess: (user) => {
      queryClient.setQueryData(authMeQueryKeys.all, (old) => {
        if (!old || typeof old !== "object") {
          return old;
        }
        return { ...old, user };
      });
      void queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
    },
  });
};
