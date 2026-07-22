import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchRaffleCreateAdvertising } from "../api/fetchRaffleCreateAdvertising";

type UseRaffleCreateAdvertisingQueryOptions = {
  enabled?: boolean;
};

export const useRaffleCreateAdvertisingQuery = ({
  enabled = true,
}: UseRaffleCreateAdvertisingQueryOptions = {}) =>
  useQuery({
    queryKey: raffleQueryKeys.createAdvertising(),
    queryFn: fetchRaffleCreateAdvertising,
    enabled,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
  });
