import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKeys } from "../../cart/model/cartQueryKeys.js";
import { spinFortuneWheel } from "../api/fortuneWheelApi.js";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys.js";

/**
 * @param {{ sellerId: string }} opts
 */
export function useSpinFortuneWheelMutation({ sellerId }) {
  const queryClient = useQueryClient();
  const id = String(sellerId ?? "").trim();
  return useMutation({
    mutationFn: () => spinFortuneWheel(id),
    // State инвалидируем не сразу, а после анимации колеса — иначе шторка
    // перерисуется «уже сыгранным» состоянием до остановки стрелки.
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fortuneWheelQueryKeys.myWins() });
      if (result?.prize?.prizeProductId) {
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.my() });
      }
    },
  });
}
