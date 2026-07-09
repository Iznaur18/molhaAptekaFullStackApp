import { useHomeCuratedProductListsQuery } from "@/entities/curated-product-list/model/useHomeCuratedProductListsQuery";
import { useFeaturedRafflesQuery } from "@/entities/raffle/model/useFeaturedRafflesQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useSiteHeaderBannerSlidesQuery } from "@/entities/site-header-banner/model/useSiteHeaderBannerSlidesQuery";
import { useUserStoriesFeedQuery } from "@/entities/user-story/model/useUserStoriesFeedQuery";

type HomeFeedContentReadyParams = {
  enabled: boolean;
  includeCuratedLists: boolean;
};

/**
 * Готовность данных всех секций главной ленты: сессия, баннер, сторисы,
 * розыгрыши, подборки. Подписывается на те же query-ключи, что и сами секции —
 * React Query дедуплицирует подписки, лишних запросов в сеть не уходит.
 *
 * isLoading (= isPending && isFetching) вместо isPending: выключенные запросы
 * (enabled: false) не фетчатся и сразу считаются готовыми.
 */
export const useHomeFeedContentReady = ({
  enabled,
  includeCuratedLists,
}: HomeFeedContentReadyParams): boolean => {
  const sessionQuery = useAuthSessionQuery();
  const bannerSlidesQuery = useSiteHeaderBannerSlidesQuery({ enabled });
  const storiesQuery = useUserStoriesFeedQuery(enabled);
  const rafflesQuery = useFeaturedRafflesQuery(enabled);
  const curatedListsQuery = useHomeCuratedProductListsQuery({
    enabled: enabled && includeCuratedLists,
  });

  return (
    !sessionQuery.isLoading &&
    !bannerSlidesQuery.isLoading &&
    !storiesQuery.isLoading &&
    !rafflesQuery.isLoading &&
    !curatedListsQuery.isLoading
  );
};
