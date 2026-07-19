import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys, cartQueryKeys } from "@/shared/api";

import {
  confirmRegistration,
  type ConfirmRegistrationParams,
} from "../api/confirmRegistration";
import { fetchAuthMe } from "../api/fetchAuthMe";

/**
 * Завершение регистрации кодом из письма: аккаунт создаётся на сервере,
 * после чего подтягивается профиль в кеш сессии.
 */
export const useConfirmRegistrationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ConfirmRegistrationParams) => {
      await confirmRegistration(params);
      return fetchAuthMe();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authMeQueryKeys.all, data);
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
  });
};
