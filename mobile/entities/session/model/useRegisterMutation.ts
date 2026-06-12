import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys, cartQueryKeys } from "@/shared/api";

import { fetchAuthMe } from "../api/fetchAuthMe";
import { registerUser, type RegisterPayload } from "../api/registerUser";

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await registerUser(payload);
      return fetchAuthMe();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKeys.all, data);
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
  });
};
