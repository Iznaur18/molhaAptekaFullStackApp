import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearAuthTokens } from "@/shared/api";

import { deleteUserProfile } from "../api/deleteUserProfile";

/**
 * Самоудаление аккаунта. После успеха сессии больше нет: чистим локальные
 * токены и весь кэш, иначе экраны продолжат отдавать данные удалённого юзера.
 */
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserProfile,
    onSuccess: async () => {
      await clearAuthTokens();
      queryClient.clear();
    },
  });
};
