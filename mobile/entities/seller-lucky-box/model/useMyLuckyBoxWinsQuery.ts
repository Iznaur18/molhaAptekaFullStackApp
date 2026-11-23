import { useQuery } from "@tanstack/react-query";

import { fetchMyLuckyBoxWins } from "../api/luckyBoxApi";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys";

/** Паритет web `useMyLuckyBoxWinsQuery`. */
export function useMyLuckyBoxWinsQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: luckyBoxQueryKeys.myWins(),
    queryFn: fetchMyLuckyBoxWins,
    enabled,
    staleTime: 30_000,
  });
}
