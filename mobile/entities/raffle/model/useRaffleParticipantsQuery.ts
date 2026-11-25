import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { fetchRaffleParticipants } from "../api/fetchRaffleParticipants";

/** Список участников грузится только когда окно открыто. */
export function useRaffleParticipantsQuery({
  raffleId,
  enabled,
}: {
  raffleId: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: raffleQueryKeys.participants(raffleId),
    enabled: enabled && Boolean(raffleId),
    queryFn: () => fetchRaffleParticipants(raffleId),
    staleTime: 30_000,
  });
}
