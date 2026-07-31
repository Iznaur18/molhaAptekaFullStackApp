import { useQuery } from "@tanstack/react-query";

import { fetchMyAffiliateEarnings } from "../api/affiliateProgram.js";

export const MY_AFFILIATE_EARNINGS_QUERY_KEY = [
  "user",
  "me",
  "affiliate-earnings",
];

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useMyAffiliateEarningsQuery(options = {}) {
  const enabled = options.enabled !== false;
  return useQuery({
    queryKey: MY_AFFILIATE_EARNINGS_QUERY_KEY,
    queryFn: fetchMyAffiliateEarnings,
    enabled,
  });
}
