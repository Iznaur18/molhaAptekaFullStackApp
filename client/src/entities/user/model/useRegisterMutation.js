import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchCurrentUserProfile } from "../api/fetchCurrentUserProfile.js";
import { registerUser } from "../api/registerUser.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      await registerUser(payload);
      return fetchCurrentUserProfile();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKeys.all, data);
    },
  });
}
