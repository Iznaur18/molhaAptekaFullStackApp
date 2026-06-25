import type { QueryClient } from "@tanstack/react-query";

import { curatedProductListQueryKeys, raffleQueryKeys, userStoriesQueryKeys } from "@/shared/api";

export const invalidateHomeFeedQueries = async (
  queryClient: QueryClient,
  catalogAllCities: boolean,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: raffleQueryKeys.featured() }),
    queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.feed() }),
    queryClient.invalidateQueries({
      queryKey: curatedProductListQueryKeys.home(catalogAllCities),
    }),
  ]);
};
