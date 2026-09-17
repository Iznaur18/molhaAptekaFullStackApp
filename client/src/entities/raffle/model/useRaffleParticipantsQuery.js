import { useQuery } from "@tanstack/react-query";

import { fetchRaffleParticipants } from "../api/fetchRaffleParticipants.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

/**
 * Список участников грузится только когда окно открыто.
 *
 * @param {{ raffleId: string; enabled: boolean }} params
 */
export function useRaffleParticipantsQuery({ raffleId, enabled }) {
  return useQuery({
    queryKey: raffleQueryKeys.participants(raffleId),
    enabled: enabled && Boolean(raffleId),
    queryFn: () => fetchRaffleParticipants(raffleId),
    staleTime: 30_000,
  });
}
