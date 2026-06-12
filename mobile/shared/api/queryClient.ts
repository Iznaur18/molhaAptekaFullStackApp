import { QueryClient } from "@tanstack/react-query";

import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
