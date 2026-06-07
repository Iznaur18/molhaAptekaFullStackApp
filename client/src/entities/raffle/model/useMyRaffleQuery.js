import { useQuery } from "@tanstack/react-query";

import { fetchMyRaffle } from "../api/fetchMyRaffle.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

/**
 * @param {{ enabled: boolean }} params
 */
export function useMyRaffleQuery({ enabled }) {
  return useQuery({
    queryKey: raffleQueryKeys.my(),
    enabled,
    queryFn: fetchMyRaffle,
  });
}
