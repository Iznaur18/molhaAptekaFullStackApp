import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchUsersSearchPage } from "../api/fetchUsersSearch.js";
import { usersSearchQueryKeys } from "./usersSearchQueryKeys.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ search: string }} params
 */
export function useUsersSearchQuery({ search }) {
  const normalizedSearch = search.trim();

  const query = useQuery({
    queryKey: usersSearchQueryKeys.list(normalizedSearch),
    queryFn: () =>
      fetchUsersSearchPage({
        search: normalizedSearch || undefined,
      }),
  });

  const phase = useMemo(() => {
    if (query.isPending) {
      return "loading";
    }
    if (query.isError) {
      return "error";
    }
    return "success";
  }, [query.isError, query.isPending]);

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
