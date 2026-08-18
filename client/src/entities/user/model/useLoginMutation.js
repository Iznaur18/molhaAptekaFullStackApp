import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assertAuthenticatedProfile,
  fetchCurrentUserProfile,
} from "../api/fetchCurrentUserProfile.js";
import { loginUser } from "../api/loginUser.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { cancelAuthMeQuery, hydrateAuthMeCache } from "../lib/authMeQueryCache.js";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      resetAuthSessionState();
      await cancelAuthMeQuery(queryClient);
    },
    mutationFn: async (credentials) => {
      await loginUser(credentials);
      return assertAuthenticatedProfile(await fetchCurrentUserProfile());
    },
    onSuccess: (data) => {
      hydrateAuthMeCache(queryClient, data);
    },
  });
}
