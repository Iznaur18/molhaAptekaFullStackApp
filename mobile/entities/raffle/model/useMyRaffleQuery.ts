import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchMyRaffle } from "../api/fetchMyRaffle";

type UseMyRaffleQueryOptions = {
  enabled?: boolean;
};

export const useMyRaffleQuery = ({ enabled = true }: UseMyRaffleQueryOptions = {}) =>
  useQuery({
    queryKey: raffleQueryKeys.my(),
    queryFn: fetchMyRaffle,
    enabled,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
  });
