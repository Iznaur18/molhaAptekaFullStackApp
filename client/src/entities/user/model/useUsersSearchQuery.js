import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { canFetchUsersSearch, isUsersSearchInputTooShort } from "@molha/api-contract";

import { fetchUsersSearchPage } from "../api/fetchUsersSearch.js";
import { usersSearchQueryKeys } from "./usersSearchQueryKeys.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ search: string }} params
 */
export function useUsersSearchQuery({ search }) {
  const normalizedSearch = search.trim();
  const canFetch = canFetchUsersSearch(normalizedSearch);

  const query = useQuery({
    queryKey: usersSearchQueryKeys.list(normalizedSearch),
    queryFn: () =>
      fetchUsersSearchPage({
        search: normalizedSearch,
      }),
    enabled: canFetch,
  });
  const phase = useMemo(() => {
    if (isUsersSearchInputTooShort(normalizedSearch)) {
      return "success";
    }
    if (!canFetch) {
      return "success";
    }
    if (query.isPending) {
      return "loading";
    }
    if (query.isError) {
      return "error";
    }
    return "success";
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
    isSearchInputTooShort: isUsersSearchInputTooShort(normalizedSearch),
  };
}
