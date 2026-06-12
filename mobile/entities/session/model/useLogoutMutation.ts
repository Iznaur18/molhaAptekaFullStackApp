import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys, cartQueryKeys } from "@/shared/api";

import { logoutUser } from "../api/logoutUser";

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(authMeQueryKeys.all, null);
      queryClient.removeQueries({ queryKey: cartQueryKeys.all });
    },
  });
};
