import type { QueryClient } from "@tanstack/react-query";

import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";
import {
  curatedProductListQueryKeys,
  raffleQueryKeys,
  userStoriesQueryKeys,
} from "@/shared/api";

export const invalidateHomeFeedQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: raffleQueryKeys.featured() }),
    queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.feed() }),
    queryClient.invalidateQueries({
      queryKey: curatedProductListQueryKeys.home(false),
    }),
    queryClient.invalidateQueries({ queryKey: siteHeaderBannerQueryKeys.slides() }),
    queryClient.invalidateQueries({ queryKey: siteHeaderBannerQueryKeys.settings() }),
  ]);
};
