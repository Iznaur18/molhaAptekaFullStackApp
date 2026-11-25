import { useQuery } from "@tanstack/react-query";

import { fetchMyFortuneWheelWins } from "../api/fortuneWheelApi";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys";

/** Паритет web `useMyFortuneWheelWinsQuery`. */
export function useMyFortuneWheelWinsQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: fortuneWheelQueryKeys.myWins(),
    queryFn: fetchMyFortuneWheelWins,
    enabled,
    staleTime: 30_000,
  });
}
