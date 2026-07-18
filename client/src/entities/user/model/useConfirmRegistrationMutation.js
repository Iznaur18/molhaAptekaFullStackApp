import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assertAuthenticatedProfile,
  fetchCurrentUserProfile,
} from "../api/fetchCurrentUserProfile.js";
import { confirmRegistration } from "../api/confirmRegistration.js";
import { hydrateAuthMeCache } from "../lib/authMeQueryCache.js";

/**
 * Завершение регистрации кодом из письма: аккаунт создаётся на сервере,
 * после чего подтягивается профиль и гидрируется кеш сессии.
 */
export function useConfirmRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, code }) => {
      await confirmRegistration({ registrationId, code });
      return assertAuthenticatedProfile(await fetchCurrentUserProfile());
    },
    onSuccess: (data) => {
      hydrateAuthMeCache(queryClient, data);
    },
  });
}
