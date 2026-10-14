import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMyDealRequests } from "../api/dealRequestApi.js";
import { dealRequestQueryKeys } from "./dealRequestQueryKeys.js";

export const DEAL_REQUESTS_PAGE_SIZE = 20;

/**
 * @param {{ role: "buyer" | "seller"; enabled?: boolean }} params
 */
export function useMyDealRequestsQuery({ role, enabled = true }) {
  return useInfiniteQuery({
    queryKey: dealRequestQueryKeys.mine(role),
    queryFn: ({ pageParam }) =>
      fetchMyDealRequests({ role, page: pageParam, limit: DEAL_REQUESTS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 15_000,
  });
}
