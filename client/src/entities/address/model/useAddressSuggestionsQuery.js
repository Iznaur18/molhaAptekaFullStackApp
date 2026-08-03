import { useQuery } from "@tanstack/react-query";

import { fetchAddressSuggestions } from "../api/fetchAddressSuggestions.js";
import { addressQueryKeys } from "./addressQueryKeys.js";

const ADDRESS_SUGGEST_STALE_TIME_MS = 60_000;

/**
 * @param {{ query: string; enabled?: boolean }} params
 */
export function useAddressSuggestionsQuery({ query, enabled = true }) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: addressQueryKeys.suggestions(normalizedQuery),
    enabled: enabled && normalizedQuery.length > 0,
    queryFn: () => fetchAddressSuggestions(normalizedQuery),
    staleTime: ADDRESS_SUGGEST_STALE_TIME_MS,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
