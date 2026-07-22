import { useQuery } from "@tanstack/react-query";

import { fetchRaffleCreateAdvertising } from "../api/fetchRaffleCreateAdvertising.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useRaffleCreateAdvertisingQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: raffleQueryKeys.createAdvertising(),
    queryFn: fetchRaffleCreateAdvertising,
    enabled,
  });
}
