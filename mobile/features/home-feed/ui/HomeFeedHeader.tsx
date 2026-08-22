import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback } from "react";

import type { HomeCuratedCategory } from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import { useHomeCuratedCategoryListsQuery } from "@/entities/curated-category-list/model/useHomeCuratedCategoryListsQuery";
import { useHomeCuratedProductListsQuery } from "@/entities/curated-product-list/model/useHomeCuratedProductListsQuery";
import { useFeaturedRafflesQuery } from "@/entities/raffle/model/useFeaturedRafflesQuery";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { useUserStoriesFeedQuery } from "@/entities/user-story/model/useUserStoriesFeedQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { HomeCuratedCategoryListsSection } from "@/features/home-feed/ui/HomeCuratedCategoryListsSection";
import { HomeCuratedListsSection } from "@/features/home-feed/ui/HomeCuratedListsSection";
import { HomeCuratedListsSectionSkeleton } from "@/features/home-feed/ui/HomeCuratedListsSectionSkeleton";
import { HomeFeaturedRafflesSection } from "@/features/home-feed/ui/HomeFeaturedRafflesSection";
import { UserStoriesStrip } from "@/features/home-feed/ui/UserStoriesStrip";
import { userStoriesQueryKeys } from "@/shared/api";

type HomeFeedHeaderProps = {
  enabled: boolean;
  showCuratedLists: boolean;
  onOpenCuratedCategory: (category: HomeCuratedCategory) => void;
};

export const HomeFeedHeader = memo(({
  enabled,
  showCuratedLists,
  onOpenCuratedCategory,
}: HomeFeedHeaderProps) => {
  const queryClient = useQueryClient();
  const { viewerRegionCode } = useViewerRegion();
  const sessionQuery = useAuthSessionQuery();
  const storiesQuery = useUserStoriesFeedQuery(enabled);
  const curatedQuery = useHomeCuratedProductListsQuery({
    enabled: enabled && showCuratedLists,
    regionCode: viewerRegionCode,
  });
  const curatedCategoriesQuery = useHomeCuratedCategoryListsQuery({
    enabled: enabled && showCuratedLists,
    regionCode: viewerRegionCode,
  });
  const rafflesQuery = useFeaturedRafflesQuery({
    enabled,
    regionCode: viewerRegionCode,
  });

  const feed = storiesQuery.data;
  const isAuthorized = sessionQuery.data?.user != null;
  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;

  const handleStoriesChanged = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.all });
  }, [queryClient]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <HomeFeaturedRafflesSection raffles={rafflesQuery.data ?? []} />
      <UserStoriesStrip
        rings={feed?.rings ?? []}
        showStrip={feed?.showStrip !== false}
        canPublish={feed?.canPublish === true}
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onPublished={handleStoriesChanged}
      />
      {showCuratedLists ? (
        curatedQuery.isPending ? (
          <HomeCuratedListsSectionSkeleton />
        ) : (
          <HomeCuratedListsSection lists={curatedQuery.data ?? []} />
        )
      ) : null}
      {showCuratedLists && !curatedCategoriesQuery.isPending ? (
        <HomeCuratedCategoryListsSection
          lists={curatedCategoriesQuery.data ?? []}
          onOpenCategory={onOpenCuratedCategory}
        />
      ) : null}
    </>
  );
});

HomeFeedHeader.displayName = "HomeFeedHeader";
