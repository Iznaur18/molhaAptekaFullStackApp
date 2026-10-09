import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchMySellerStorePause,
  setMySellerStorePause,
} from "../api/sellerStorePauseApi.js";

export const sellerStorePauseQueryKeys = {
  me: () => ["seller-store-pause", "me"],
};

/** @param {{ enabled?: boolean }} [options] */
export function useMySellerStorePauseQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerStorePauseQueryKeys.me(),
    queryFn: fetchMySellerStorePause,
    enabled,
    staleTime: 30_000,
  });
}

export function useSetMySellerStorePauseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setMySellerStorePause,
    onSuccess: (storePause) => {
      queryClient.setQueryData(sellerStorePauseQueryKeys.me(), storePause);
      // Пауза меняет видимость сразу всех товаров — и в «Моих товарах», и в ленте.
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
}
