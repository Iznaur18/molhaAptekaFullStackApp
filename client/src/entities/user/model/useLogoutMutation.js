import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutUser } from "../api/logoutUser.js";
import { clearAuthMeCache } from "../lib/authMeQueryCache.js";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearAuthMeCache(queryClient);
    },
  });
}
