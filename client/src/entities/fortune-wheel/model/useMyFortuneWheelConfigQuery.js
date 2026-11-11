import { useQuery } from "@tanstack/react-query";

import { fetchMyFortuneWheelConfig } from "../api/fortuneWheelApi.js";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useMyFortuneWheelConfigQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: fortuneWheelQueryKeys.myConfig(),
    queryFn: fetchMyFortuneWheelConfig,
    enabled,
    staleTime: 30_000,
  });
}
