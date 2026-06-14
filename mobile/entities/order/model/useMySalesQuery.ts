import { useQuery } from "@tanstack/react-query";

import { orderQueryKeys } from "@/shared/api";

import { fetchMySales } from "../api/fetchMySales";

type UseMySalesQueryOptions = {
  status?: string;
  search?: string;
  enabled?: boolean;
};

export const useMySalesQuery = ({
  status,
  search,
  enabled = true,
}: UseMySalesQueryOptions = {}) => {
  const params = {
    ...(status ? { status } : {}),
    ...(search?.trim() ? { search: search.trim() } : {}),
  };

  return useQuery({
    queryKey: orderQueryKeys.sales(params),
    queryFn: () => fetchMySales(params),
    enabled,
  });
};
