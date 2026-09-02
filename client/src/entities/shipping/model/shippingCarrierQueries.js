import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchShippingCarriers,
  fetchStaffShippingCarriers,
  toggleShippingCarrier,
} from "../api/shippingCarriersApi.js";

export const shippingCarrierKeys = {
  public: () => ["shipping-carriers"],
  staff: () => ["shipping-carriers", "staff"],
};

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
