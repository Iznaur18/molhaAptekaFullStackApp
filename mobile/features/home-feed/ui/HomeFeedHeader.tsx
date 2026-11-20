import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback } from "react";
import { Text } from "react-native";

import { useHomeCuratedProductListsQuery } from "@/entities/curated-product-list/model/useHomeCuratedProductListsQuery";
import { useProductPromotionBoostProductsQuery } from "@/entities/product/model/useProductPromotionBoostProductsQuery";
import { BoostProductsHomeSection } from "@/entities/product/ui/BoostProductsHomeSection";
import { useFeaturedRafflesQuery } from "@/entities/raffle/model/useFeaturedRafflesQuery";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { useUserStoriesFeedQuery } from "@/entities/user-story/model/useUserStoriesFeedQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { HomeCuratedListsSection } from "@/features/home-feed/ui/HomeCuratedListsSection";
import { HomeCuratedListsSectionSkeleton } from "@/features/home-feed/ui/HomeCuratedListsSectionSkeleton";
import { HomeFeaturedRafflesSection } from "@/features/home-feed/ui/HomeFeaturedRafflesSection";
import { UserStoriesStrip } from "@/features/home-feed/ui/UserStoriesStrip";
import { userStoriesQueryKeys } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useBoostProductsHomeSectionStyles } from "@/shared/theme/boostProductsHomeStyles";

type HomeFeedHeaderProps = {
  enabled: boolean;
  showCuratedLists: boolean;
};

export const HomeFeedHeader = memo(
  ({ enabled, showCuratedLists }: HomeFeedHeaderProps) => {
    const queryClient = useQueryClient();
    const boostStyles = useBoostProductsHomeSectionStyles();
    const { viewerRegionCode } = useViewerRegion();
    const sessionQuery = useAuthSessionQuery();
    const storiesQuery = useUserStoriesFeedQuery(enabled);
    const showBoostProductsRow = enabled && showCuratedLists;
    const boostProductsQuery = useProductPromotionBoostProductsQuery({
      enabled: showBoostProductsRow,
      regionCode: viewerRegionCode ?? "",
    });
    const curatedQuery = useHomeCuratedProductListsQuery({
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

    const boostErrorMessage =
      showBoostProductsRow && boostProductsQuery.isError
        ? formatApiErrorMessage(
            boostProductsQuery.error,
            API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_BOOST_PRODUCTS_FALLBACK,
          )
        : null;

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
        {boostErrorMessage ? (
          <Text style={boostStyles.error}>{boostErrorMessage}</Text>
        ) : null}
        {showBoostProductsRow ? (
          <BoostProductsHomeSection products={boostProductsQuery.data ?? []} />
        ) : null}
        {showCuratedLists ? (
          curatedQuery.isPending ? (
            <HomeCuratedListsSectionSkeleton />
          ) : (
            <HomeCuratedListsSection lists={curatedQuery.data ?? []} />
          )
        ) : null}
      </>
    );
  },
);

HomeFeedHeader.displayName = "HomeFeedHeader";
