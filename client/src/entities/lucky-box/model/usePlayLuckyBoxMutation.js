import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: luckyBoxQueryKeys.stateBySeller(id),
      });
      // Выигрыш мог появиться — корзина и список выигрышей должны обновиться.
      queryClient.invalidateQueries({ queryKey: luckyBoxQueryKeys.myWins() });
    },
  });
}
