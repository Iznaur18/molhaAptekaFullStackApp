import { useMutation, useQueryClient } from "@tanstack/react-query";

import { playLuckyBox } from "../api/luckyBoxApi";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys";

/** Паритет web `usePlayLuckyBoxMutation`. */
export function usePlayLuckyBoxMutation({ sellerId }: { sellerId: string }) {
  const queryClient = useQueryClient();
  const id = String(sellerId ?? "").trim();
  return useMutation({
    mutationFn: (boxIndex: number) => playLuckyBox(id, boxIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: luckyBoxQueryKeys.stateBySeller(id),
      });
      // Выигрыш мог появиться — список выигрышей должен обновиться.
      queryClient.invalidateQueries({ queryKey: luckyBoxQueryKeys.myWins() });
    },
  });
}
