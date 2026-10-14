import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDealRequest, postDealRequestAction } from "../api/dealRequestApi.js";
import { dealRequestQueryKeys } from "./dealRequestQueryKeys.js";

export function useCreateDealRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDealRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dealRequestQueryKeys.all }),
  });
}

/**
 * Любое действие над заявкой. Списки перечитываются и после ошибки: «заявка
 * уже изменилась» значит, что на экране устаревшие кнопки.
 */
export function useDealRequestActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postDealRequestAction,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: dealRequestQueryKeys.all }),
  });
}
