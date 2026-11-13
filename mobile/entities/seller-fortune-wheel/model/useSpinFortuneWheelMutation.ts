import { useMutation, useQueryClient } from "@tanstack/react-query";

import { spinFortuneWheel } from "../api/fortuneWheelApi";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys";

/**
 * Паритет web `useSpinFortuneWheelMutation`: state инвалидируем не сразу,
 * а после анимации колеса (onSpinSettled в шторке).
 */
export function useSpinFortuneWheelMutation({ sellerId }: { sellerId: string }) {
  const queryClient = useQueryClient();
  const id = String(sellerId ?? "").trim();
  return useMutation({
    mutationFn: () => spinFortuneWheel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fortuneWheelQueryKeys.myWins() });
    },
  });
}
