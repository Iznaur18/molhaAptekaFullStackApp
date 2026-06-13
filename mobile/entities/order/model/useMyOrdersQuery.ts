import { useQuery } from "@tanstack/react-query";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { orderQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchMyOrders } from "../api/fetchMyOrders";

export const useMyOrdersQuery = () => {
  const isAuthorized = useIsAuthorized();

  return useQuery({
    queryKey: orderQueryKeys.my(),
    queryFn: fetchMyOrders,
    enabled: isAuthorized,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
  });
};
