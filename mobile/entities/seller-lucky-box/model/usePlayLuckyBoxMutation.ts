import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKeys } from "@/shared/api";

import { playLuckyBox } from "../api/luckyBoxApi";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys";

/** Паритет web `usePlayLuckyBoxMutation`. */
export function usePlayLuckyBoxMutation({ sellerId }: { sellerId: string }) {
  const queryClient = useQueryClient();
  const id = String(sellerId ?? "").trim();
  return useMutation({
    mutationFn: (boxIndex: number) => playLuckyBox(id, boxIndex),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: luckyBoxQueryKeys.stateBySeller(id),
      });
      queryClient.invalidateQueries({ queryKey: luckyBoxQueryKeys.myWins() });
      if (result?.prize?.prizeProductId) {
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
      }
    },
  });
}
