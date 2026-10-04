import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchShippingCarrierInfo,
  fetchShippingCarriers,
  fetchStaffShippingCarrierInfo,
  fetchStaffShippingCarriers,
  saveShippingCarrierInfo,
  toggleShippingCarrier,
} from "../api/shippingCarriersApi.js";

export const shippingCarrierKeys = {
  public: () => ["shipping-carriers"],
  staff: () => ["shipping-carriers", "staff"],
  info: () => ["shipping-carrier-info"],
  staffInfo: () => ["shipping-carrier-info", "staff"],
};

/**
 * Справки по службам доставки (только заполненные) — для кнопки «!».
 * Меняются редко, поэтому кэш долгий.
 */
export function useShippingCarrierInfoQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: shippingCarrierKeys.info(),
    queryFn: fetchShippingCarrierInfo,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useStaffShippingCarrierInfoQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: shippingCarrierKeys.staffInfo(),
    queryFn: fetchStaffShippingCarrierInfo,
    enabled,
    staleTime: 10_000,
  });
}

export function useSaveShippingCarrierInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveShippingCarrierInfo,
    onSuccess: (items) => {
      queryClient.setQueryData(shippingCarrierKeys.staffInfo(), items);
      // Справку видят покупатели и продавцы — им тоже нужна свежая.
      void queryClient.invalidateQueries({
        queryKey: shippingCarrierKeys.info(),
        exact: true,
      });
    },
  });
}

/**
 * Доступные службы доставки.
 *
 * Список задаёт админ, поэтому держать его копию в клиентских константах
 * нельзя: выключенная служба должна пропадать без пересборки.
 */
export function useShippingCarriersQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: shippingCarrierKeys.public(),
    queryFn: fetchShippingCarriers,
    enabled,
    staleTime: 60_000,
  });
}

export function useStaffShippingCarriersQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: shippingCarrierKeys.staff(),
    queryFn: fetchStaffShippingCarriers,
    enabled,
    staleTime: 10_000,
  });
}

export function useToggleShippingCarrierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleShippingCarrier,
    onSuccess: () => {
      // Переключение меняет и то, что видят продавцы с покупателями.
      void queryClient.invalidateQueries({ queryKey: shippingCarrierKeys.public() });
      void queryClient.invalidateQueries({ queryKey: shippingCarrierKeys.staff() });
    },
  });
}
