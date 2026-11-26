import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKeys } from "../../cart/model/cartQueryKeys.js";
import { playLuckyBox } from "../api/luckyBoxApi.js";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys.js";

/**
 * @param {{ sellerId: string }} opts
 */
export function usePlayLuckyBoxMutation({ sellerId }) {
  const queryClient = useQueryClient();
  const id = String(sellerId ?? "").trim();
  return useMutation({
    mutationFn: (boxIndex) => playLuckyBox(id, boxIndex),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: luckyBoxQueryKeys.stateBySeller(id),
      });
      queryClient.invalidateQueries({ queryKey: luckyBoxQueryKeys.myWins() });
      // Товар-приз сервер кладёт в корзину — обновляем badge/hydrate.
      if (result?.prize?.prizeProductId) {
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.my() });
      }
    },
  });
}
