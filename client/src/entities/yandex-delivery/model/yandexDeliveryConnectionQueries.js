import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchYandexDeliveryConnection,
  removeYandexDeliveryConnection,
  saveYandexDropoff,
  saveYandexDeliveryConnection,
  toggleYandexDeliveryConnection,
} from "../api/yandexDeliveryCredentialsApi.js";
import { saveYandexExpressSettings } from "../api/yandexExpressClaimApi.js";

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
      // Ответы про токен и пункт сдачи не несут «Экспресс» — его сохраняем.
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, (prev) =>
        state && !state.express && prev?.express
          ? { ...state, express: prev.express }
          : state,
      );
    },
  });
}

export const useSaveYandexDeliveryConnectionMutation = () =>
  useConnectionMutation(saveYandexDeliveryConnection);
export const useRemoveYandexDeliveryConnectionMutation = () =>
  useConnectionMutation(removeYandexDeliveryConnection);
export const useToggleYandexDeliveryConnectionMutation = () =>
  useConnectionMutation(toggleYandexDeliveryConnection);
export const useSaveYandexDropoffMutation = () =>
  useConnectionMutation(saveYandexDropoff);

/** «Экспресс»: ответ — только его часть, вклеиваем в состояние подключения. */
export function useSaveYandexExpressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveYandexExpressSettings,
    onSuccess: (express) => {
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, (prev) =>
        prev ? { ...prev, express } : prev,
      );
    },
  });
}
