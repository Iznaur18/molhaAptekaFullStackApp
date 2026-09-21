import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchYandexDeliveryConnection,
  removeYandexDeliveryConnection,
  saveYandexDeliveryConnection,
  toggleYandexDeliveryConnection,
} from "../api/yandexDeliveryCredentialsApi.js";

export const yandexDeliveryConnectionQueryKeys = {
  mine: ["yandex-delivery", "connection", "me"],
};

/** @param {{ enabled?: boolean }} [params] */
export function useMyYandexDeliveryConnectionQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: yandexDeliveryConnectionQueryKeys.mine,
    queryFn: fetchYandexDeliveryConnection,
    enabled,
    staleTime: 60_000,
  });
}

/** @param {(payload?: any) => Promise<unknown>} mutationFn */
function useConnectionMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // Ответ уже несёт новое состояние — лишний запрос не нужен.
    onSuccess: (state) => {
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, state);
    },
  });
}

export const useSaveYandexDeliveryConnectionMutation = () =>
  useConnectionMutation(saveYandexDeliveryConnection);
export const useRemoveYandexDeliveryConnectionMutation = () =>
  useConnectionMutation(removeYandexDeliveryConnection);
export const useToggleYandexDeliveryConnectionMutation = () =>
  useConnectionMutation(toggleYandexDeliveryConnection);
