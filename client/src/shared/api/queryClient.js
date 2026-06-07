import { QueryClient } from "@tanstack/react-query";

export const AUTH_ME_STALE_TIME_MS = 60_000;
export const STAFF_BADGE_STALE_TIME_MS = 30_000;
export const DEFAULT_QUERY_STALE_TIME_MS = 30_000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME_MS,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  });
}
