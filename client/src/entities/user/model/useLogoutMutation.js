import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutUser } from "../api/logoutUser.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(authMeQueryKeys.all, null);
    },
  });
}
