import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchMySellerCommerceDefaults,
  saveMySellerCommerceDefaults,
} from "../api/sellerCommerceDefaultsApi.js";

export const sellerCommerceDefaultsQueryKeys = {
  me: () => ["seller-commerce-defaults", "me"],
};

/** @param {{ enabled?: boolean }} [options] */
export function useMySellerCommerceDefaultsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerCommerceDefaultsQueryKeys.me(),
    queryFn: fetchMySellerCommerceDefaults,
    enabled,
    staleTime: 30_000,
  });
}

export function useSaveSellerCommerceDefaultsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMySellerCommerceDefaults,
    onSuccess: (defaults) => {
      queryClient.setQueryData(sellerCommerceDefaultsQueryKeys.me(), defaults);
      // Сохранение переписывает адрес и перевозчика у всех товаров, что
      // следуют профилю: закэшированные карточки после этого врут.
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
}
