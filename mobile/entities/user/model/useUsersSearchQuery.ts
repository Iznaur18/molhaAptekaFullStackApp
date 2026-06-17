import { canFetchUsersSearch, isUsersSearchInputTooShort } from "@molha/api-contract";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { API_CLIENT_UI } from "@/shared/config";

import { fetchUsersSearchPage } from "../api/fetchUsersSearchPage";
import { usersSearchQueryKeys } from "./usersSearchQueryKeys";

type UseUsersSearchQueryOptions = {
  search: string;
};

export const useUsersSearchQuery = ({ search }: UseUsersSearchQueryOptions) => {
  const normalizedSearch = search.trim();
  const canFetch = canFetchUsersSearch(normalizedSearch);

  const query = useQuery({
    queryKey: usersSearchQueryKeys.list(normalizedSearch),
    queryFn: () => fetchUsersSearchPage({ search: normalizedSearch }),
    enabled: canFetch,
  });

  const phase = useMemo(() => {
    if (isUsersSearchInputTooShort(normalizedSearch)) {
      return "success" as const;
    }
    if (!canFetch) {
      return "success" as const;
    }
    if (query.isPending) {
      return "loading" as const;
    }
    if (query.isError) {
      return "error" as const;
    }
    return "success" as const;
  }, [canFetch, normalizedSearch, query.isError, query.isPending]);

  const error =
    query.isError && query.error instanceof Error
      ? query.error.message
      : query.isError
        ? API_CLIENT_UI.FETCH_USERS_SEARCH_FALLBACK
        : "";

  return {
    phase,
    users: query.data?.users ?? [],
    error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isSearchInputTooShort: isUsersSearchInputTooShort(normalizedSearch),
  };
};
