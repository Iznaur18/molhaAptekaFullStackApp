import { useQuery } from "@tanstack/react-query";

import { fetchMyAffiliateSales } from "../api/affiliateProgram.js";

export const MY_AFFILIATE_SALES_QUERY_KEY = ["user", "me", "affiliate-sales"];

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useMyAffiliateSalesQuery(options = {}) {
  const enabled = options.enabled !== false;
  return useQuery({
    queryKey: MY_AFFILIATE_SALES_QUERY_KEY,
    queryFn: fetchMyAffiliateSales,
    enabled,
    staleTime: 30_000,
  });
}
