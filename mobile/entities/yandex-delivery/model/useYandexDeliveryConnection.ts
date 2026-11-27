import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchYandexDeliveryConnection,
  fetchYandexDropoffPoints,
  removeYandexDeliveryConnection,
  saveYandexDeliveryConnection,
  saveYandexDropoff,
  toggleYandexDeliveryConnection,
} from "@/entities/yandex-delivery/api/yandexDeliveryCredentialsApi";

export const yandexDeliveryConnectionQueryKeys = {
  mine: ["yandex-delivery", "connection", "me"] as const,
};

export const useMyYandexDeliveryConnectionQuery = (enabled = true) =>
  useQuery({
    queryKey: yandexDeliveryConnectionQueryKeys.mine,
    queryFn: fetchYandexDeliveryConnection,
    enabled,
    staleTime: 60_000,
  });

export const useSaveYandexDeliveryConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveYandexDeliveryConnection,
    onSuccess: (yandexDelivery) => {
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, yandexDelivery);
    },
  });
};

export const useRemoveYandexDeliveryConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeYandexDeliveryConnection,
    onSuccess: (yandexDelivery) => {
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, yandexDelivery);
    },
  });
};

export const useToggleYandexDeliveryConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleYandexDeliveryConnection,
    onSuccess: (yandexDelivery) => {
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, yandexDelivery);
    },
  });
};

export const useYandexDropoffPointsMutation = () =>
  useMutation({
    mutationFn: fetchYandexDropoffPoints,
  });

export const useSaveYandexDropoffMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveYandexDropoff,
    onSuccess: (yandexDelivery) => {
      queryClient.setQueryData(yandexDeliveryConnectionQueryKeys.mine, yandexDelivery);
    },
  });
};
