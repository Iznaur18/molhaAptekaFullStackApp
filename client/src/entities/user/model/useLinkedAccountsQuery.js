import { useQuery } from "@tanstack/react-query";

import { fetchLinkedAccounts } from "../api/linkedAccountsApi.js";
import { linkedAccountsQueryKeys } from "./linkedAccountsQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useLinkedAccountsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: linkedAccountsQueryKeys.all,
    queryFn: fetchLinkedAccounts,
    enabled,
    staleTime: 30_000,
  });
}
