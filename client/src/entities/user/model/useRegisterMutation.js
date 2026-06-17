import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assertAuthenticatedProfile,
  fetchCurrentUserProfile,
} from "../api/fetchCurrentUserProfile.js";
import { registerUser } from "../api/registerUser.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { hydrateAuthMeCache } from "../lib/authMeQueryCache.js";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      resetAuthSessionState();
      await queryClient.cancelQueries();
    },
    mutationFn: async (payload) => {
      await registerUser(payload);
      return assertAuthenticatedProfile(await fetchCurrentUserProfile());
    },
    onSuccess: (data) => {
      hydrateAuthMeCache(queryClient, data);
    },
  });
}
