import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerUser } from "../api/registerUser.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";

/**
 * Начало регистрации: возвращает `{ registrationId, email }` заявки.
 * Сессия появляется только после `useConfirmRegistrationMutation`.
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      resetAuthSessionState();
      await queryClient.cancelQueries();
    },
    mutationFn: (payload) => registerUser(payload),
  });
}
