import { useQuery } from "@tanstack/react-query";

import { addressQueryKeys } from "@/shared/api";

import { fetchAddressSuggestions } from "../api/fetchAddressSuggestions";
import { ADDRESS_SUGGEST_STALE_TIME_MS } from "./constants";

type UseAddressSuggestionsQueryParams = {
  query: string;
  enabled?: boolean;
};

export const useAddressSuggestionsQuery = ({
  query,
  enabled = true,
}: UseAddressSuggestionsQueryParams) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: addressQueryKeys.suggestions(normalizedQuery),
    queryFn: () => fetchAddressSuggestions(normalizedQuery),
    enabled: enabled && normalizedQuery.length > 0,
    staleTime: ADDRESS_SUGGEST_STALE_TIME_MS,
  });
};
