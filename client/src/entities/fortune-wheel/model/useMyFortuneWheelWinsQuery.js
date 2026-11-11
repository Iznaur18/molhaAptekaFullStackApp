import { useQuery } from "@tanstack/react-query";

import { fetchMyFortuneWheelWins } from "../api/fortuneWheelApi.js";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useMyFortuneWheelWinsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: fortuneWheelQueryKeys.myWins(),
    queryFn: fetchMyFortuneWheelWins,
    enabled,
    staleTime: 30_000,
  });
}
