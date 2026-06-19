import { useQueryClient } from "@tanstack/react-query";

import { useHomeCuratedProductListsQuery } from "@/entities/curated-product-list/model/useHomeCuratedProductListsQuery";
import { useFeaturedRafflesQuery } from "@/entities/raffle/model/useFeaturedRafflesQuery";
import { useUserStoriesFeedQuery } from "@/entities/user-story/model/useUserStoriesFeedQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { HomeCuratedListsSection } from "@/features/home-feed/ui/HomeCuratedListsSection";
import { HomeFeaturedRafflesSection } from "@/features/home-feed/ui/HomeFeaturedRafflesSection";
import { UserStoriesStrip } from "@/features/home-feed/ui/UserStoriesStrip";
import { userStoriesQueryKeys } from "@/shared/api";

type HomeFeedHeaderProps = {
  enabled: boolean;
};

export const HomeFeedHeader = ({ enabled }: HomeFeedHeaderProps) => {
  const queryClient = useQueryClient();
  const sessionQuery = useAuthSessionQuery();
  const storiesQuery = useUserStoriesFeedQuery(enabled);
  const curatedQuery = useHomeCuratedProductListsQuery(enabled);
  const rafflesQuery = useFeaturedRafflesQuery(enabled);

  const feed = storiesQuery.data;
  const isAuthorized = sessionQuery.data?.user != null;
  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;

  const handleStoriesChanged = () => {
    void queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.all });
  };

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
      <HomeCuratedListsSection lists={curatedQuery.data ?? []} />
    </>
  );
};
