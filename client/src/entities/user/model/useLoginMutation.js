import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchCurrentUserProfile } from "../api/fetchCurrentUserProfile.js";
import { loginUser } from "../api/loginUser.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      await loginUser(credentials);
      return fetchCurrentUserProfile();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKeys.all, data);
    },
  });
}
