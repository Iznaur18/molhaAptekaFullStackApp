import { useQuery } from "@tanstack/react-query";

import { fetchMyFortuneWheelConfig } from "../api/fortuneWheelApi";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys";

/** Паритет web `useMyFortuneWheelConfigQuery`. */
export function useMyFortuneWheelConfigQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: fortuneWheelQueryKeys.myConfig(),
    queryFn: fetchMyFortuneWheelConfig,
    enabled,
    staleTime: 30_000,
  });
}