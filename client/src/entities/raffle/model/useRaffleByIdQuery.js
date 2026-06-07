import { useQuery } from "@tanstack/react-query";

import { fetchRaffleById } from "../api/fetchRaffleById.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

/**
 * @param {{ raffleId: string; enabled?: boolean }} params
 */
export function useRaffleByIdQuery({ raffleId, enabled = true }) {
  return useQuery({
    queryKey: raffleQueryKeys.detail(raffleId),
    enabled: enabled && Boolean(raffleId),
    queryFn: () => fetchRaffleById(raffleId),
  });
}
