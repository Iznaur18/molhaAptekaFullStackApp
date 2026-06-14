import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";
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
  const canSearch = normalizedSearch.length >= USER_SEARCH_MIN_LENGTH;

  const query = useQuery({
    queryKey: usersSearchQueryKeys.list(normalizedSearch),
    queryFn: () => fetchUsersSearchPage({ search: normalizedSearch }),
    enabled: canSearch,
  });

  const phase = useMemo(() => {
    if (!canSearch) {
      return "success" as const;
    }
    if (query.isPending) {
      return "loading" as const;
    }
    if (query.isError) {
      return "error" as const;
    }
    return "success" as const;
  }, [canSearch, query.isError, query.isPending]);

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
  };
};
