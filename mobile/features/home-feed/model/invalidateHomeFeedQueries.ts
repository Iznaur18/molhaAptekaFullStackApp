import type { QueryClient } from "@tanstack/react-query";

import { curatedCategoryListQueryKeys } from "@/entities/curated-category-list/model/curatedCategoryListQueryKeys";
import { productPromotionQueryKeys } from "@/entities/product/model/productPromotionQueryKeys";
import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";
import {
  curatedProductListQueryKeys,
  raffleQueryKeys,
  sellerPersonalCategoryQueryKeys,
  userStoriesQueryKeys,
} from "@/shared/api";

export const invalidateHomeFeedQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...raffleQueryKeys.all, "featured"],
    }),
    queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.feed() }),
    queryClient.invalidateQueries({
      queryKey: productPromotionQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: curatedProductListQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: [...siteHeaderBannerQueryKeys.all, "slides"],
    }),
    queryClient.invalidateQueries({ queryKey: siteHeaderBannerQueryKeys.settings() }),
    queryClient.invalidateQueries({
      queryKey: [...sellerPersonalCategoryQueryKeys.all, "catalog-tiles"],
    }),
    queryClient.invalidateQueries({ queryKey: curatedCategoryListQueryKeys.all }),
  ]);
};
