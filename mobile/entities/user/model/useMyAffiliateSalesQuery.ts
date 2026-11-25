import { useQuery } from "@tanstack/react-query";

import { fetchMyAffiliateSales } from "@/entities/user/api/affiliateProgram";

export const MY_AFFILIATE_SALES_QUERY_KEY = ["user", "me", "affiliate-sales"] as const;

type UseMyAffiliateSalesQueryOptions = {
  enabled?: boolean;
};

export function useMyAffiliateSalesQuery({
  enabled = true,
}: UseMyAffiliateSalesQueryOptions = {}) {
  return useQuery({
    queryKey: MY_AFFILIATE_SALES_QUERY_KEY,
    queryFn: fetchMyAffiliateSales,
    enabled,
    staleTime: 30_000,
  });
}
