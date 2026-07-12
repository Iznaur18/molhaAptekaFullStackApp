import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback } from "react";

import { useHomeCuratedProductListsQuery } from "@/entities/curated-product-list/model/useHomeCuratedProductListsQuery";
import { useFeaturedRafflesQuery } from "@/entities/raffle/model/useFeaturedRafflesQuery";
import { useUserStoriesFeedQuery } from "@/entities/user-story/model/useUserStoriesFeedQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { HomeCuratedListsSection } from "@/features/home-feed/ui/HomeCuratedListsSection";
import { HomeCuratedListsSectionSkeleton } from "@/features/home-feed/ui/HomeCuratedListsSectionSkeleton";
import { HomeFeaturedRafflesSection } from "@/features/home-feed/ui/HomeFeaturedRafflesSection";
import { UserStoriesStrip } from "@/features/home-feed/ui/UserStoriesStrip";
import { userStoriesQueryKeys } from "@/shared/api";

type HomeFeedHeaderProps = {
  enabled: boolean;
  showCuratedLists: boolean;
};

export const HomeFeedHeader = memo(({
  enabled,
  showCuratedLists,
}: HomeFeedHeaderProps) => {
  const queryClient = useQueryClient();
  const sessionQuery = useAuthSessionQuery();
  const storiesQuery = useUserStoriesFeedQuery(enabled);
  const curatedQuery = useHomeCuratedProductListsQuery({
    enabled: enabled && showCuratedLists,
  });
  const rafflesQuery = useFeaturedRafflesQuery(enabled);

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
    </>
  );
});

HomeFeedHeader.displayName = "HomeFeedHeader";
