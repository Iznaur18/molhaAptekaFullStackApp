import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";

import { fetchUsersSearchPage } from "../api/fetchUsersSearch.js";
import { usersSearchQueryKeys } from "./usersSearchQueryKeys.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ search: string }} params
 */
export function useUsersSearchQuery({ search }) {
  const normalizedSearch = search.trim();
  const canSearch = normalizedSearch.length >= USER_SEARCH_MIN_LENGTH;

  const query = useQuery({
    queryKey: usersSearchQueryKeys.list(normalizedSearch),
    queryFn: () =>
      fetchUsersSearchPage({
        search: normalizedSearch,
      }),
    enabled: canSearch,
  });
  const phase = useMemo(() => {
    if (!canSearch) {
      return "success";
    }
    if (query.isPending) {
      return "loading";
    }
    if (query.isError) {
      return "error";
    }
    return "success";
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
  };
}
