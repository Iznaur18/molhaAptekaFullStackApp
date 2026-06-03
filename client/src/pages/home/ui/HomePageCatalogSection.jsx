import { useNavigate } from "react-router-dom";

import { RaffleFeaturedCarousel } from "../../../entities/raffle/ui/RaffleFeaturedCarousel.jsx";
import { UserStoriesStrip } from "../../../entities/user-story/ui/UserStoriesStrip.jsx";
import { CatalogBrowserLanding } from "../../../entities/product-category-display/ui/CatalogBrowserLanding.jsx";
import { buildRafflePath } from "../../../shared/lib/rafflePaths.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { HomeCatalogGrid } from "./HomeCatalogGrid.jsx";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {{
 *   catalogStatus: { kind: string; message?: string };
 *   products: ProductFromApi[];
 *   isHomeCatalogMainView: boolean;
 *   featuredRaffles: import('../../../entities/raffle/model/types.js').RaffleFromApi[];
 *   featuredRaffleIndex: number;
 *   onFeaturedRaffleIndexChange: (index: number) => void;
 *   getFeaturedRaffleManage: (raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi) => object | null;
 *   userStoriesFeed: import('../../../entities/user-story/model/types.js').UserStoriesFeedFromApi;
 *   isAuthorized: boolean;
 *   currentUserId: string | null;
 *   onUserStoriesRefresh: () => void;
 *   onSellerNameClick: (userId: string) => void;
 *   mainView: string;
 *   activeCatalogBrowserCategory: string | null;
 *   selectedProductCategory: string | null;
 *   hasProductSearchQuery: boolean;
 *   isMineMode: boolean;
 *   deletingProductId: string | null;
 *   onDeleteMyProduct: (productId: string) => void;
 *   onEditMyProduct: (product: ProductFromApi) => void;
 *   onPromoteMyProduct: (product: ProductFromApi) => void;
 *   pendingPromotionProductIds: Set<string>;
 *   myProductsCatalogError: string;
 *   myProductsCatalogNotice: string;
 *   onOpenProductDetails: (product: ProductFromApi) => void;
 *   onSetMyProductAvailability: (productId: string, available: boolean) => void;
 *   onSetMyProductAuction: (productId: string, isAuction: boolean) => void;
 *   togglingAvailabilityProductId: string | null;
 *   togglingAuctionProductId: string | null;
 *   isPremiumUser: boolean;
 *   sellerLoyaltyPointsBalance: number;
 *   sellerLoyaltyPointsReserved: number;
 *   onRequestLoginAddToCart: () => void;
 *   catalogSentinelRef: import('react').RefObject<HTMLElement | null>;
 *   catalogHasMore: boolean;
 *   isCatalogLoadingMore: boolean;
 *   catalogLoadMoreError: string | null;
 *   onRetryCatalogLoadMore: () => void;
 *   myProductsModerationFilter: string;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   sellerRaffleActive: boolean;
 *   onToggleRaffleParticipation: (productId: string, participate: boolean) => void;
 *   raffleParticipationPendingProductId: string | null;
 * }} props
 */
export function HomePageCatalogGridSection({
  catalogStatus,
  products,
  isHomeCatalogMainView,
  featuredRaffles,
  featuredRaffleIndex,
  onFeaturedRaffleIndexChange,
  getFeaturedRaffleManage,
  userStoriesFeed,
  isAuthorized,
  currentUserId,
  onUserStoriesRefresh,
  onSellerNameClick,
  mainView,
  activeCatalogBrowserCategory,
  selectedProductCategory,
  hasProductSearchQuery,
  isMineMode,
  deletingProductId,
  onDeleteMyProduct,
  onEditMyProduct,
  onPromoteMyProduct,
  pendingPromotionProductIds,
  myProductsCatalogError,
  myProductsCatalogNotice,
  onOpenProductDetails,
  onSetMyProductAvailability,
  onSetMyProductAuction,
  togglingAvailabilityProductId,
  togglingAuctionProductId,
  isPremiumUser,
  sellerLoyaltyPointsBalance,
  sellerLoyaltyPointsReserved,
  onRequestLoginAddToCart,
  catalogSentinelRef,
  catalogHasMore,
  isCatalogLoadingMore,
  catalogLoadMoreError,
  onRetryCatalogLoadMore,
  myProductsModerationFilter,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  sellerRaffleActive,
  onToggleRaffleParticipation,
  raffleParticipationPendingProductId,
}) {
  const navigate = useNavigate();

  if (catalogStatus.kind === "loading" && products.length === 0) {
    return <p className="home-page__state">{HOME_PAGE_UI.LOADING_CATALOG}</p>;
  }

  if (catalogStatus.kind === "error") {
    return (
      <p className="home-page__state home-page__state_error" role="alert">
        {catalogStatus.message}
      </p>
    );
  }

  return (
    <>
      {isHomeCatalogMainView && featuredRaffles.length > 0 ? (
        <RaffleFeaturedCarousel
          raffles={featuredRaffles}
          activeIndex={featuredRaffleIndex}
          onActiveIndexChange={onFeaturedRaffleIndexChange}
          onOpenProducts={(raffleId) => navigate(buildRafflePath(raffleId))}
          getManage={getFeaturedRaffleManage}
        />
      ) : null}
      {isHomeCatalogMainView && userStoriesFeed.showStrip ? (
        <UserStoriesStrip
          rings={userStoriesFeed.rings}
          canPublish={userStoriesFeed.canPublish}
          showStrip={userStoriesFeed.showStrip}
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onRefresh={onUserStoriesRefresh}
          onOpenProfile={onSellerNameClick}
        />
      ) : null}
      <HomeCatalogGrid
        products={products}
        selectedProductCategory={
          mainView === "catalog-browser"
            ? activeCatalogBrowserCategory
            : selectedProductCategory
        }
        hasQuery={hasProductSearchQuery}
        isMineMode={isMineMode}
        deletingProductId={deletingProductId}
        onSellerNameClick={onSellerNameClick}
        onDeleteMyProduct={onDeleteMyProduct}
        onEditMyProduct={onEditMyProduct}
        onPromoteMyProduct={onPromoteMyProduct}
        pendingPromotionProductIds={pendingPromotionProductIds}
        myProductsCatalogError={myProductsCatalogError}
        myProductsCatalogNotice={myProductsCatalogNotice}
        onOpenProductDetails={onOpenProductDetails}
        onSetMyProductAvailability={onSetMyProductAvailability}
        onSetMyProductAuction={onSetMyProductAuction}
        togglingAvailabilityProductId={togglingAvailabilityProductId}
        togglingAuctionProductId={togglingAuctionProductId}
        isAuthorized={isAuthorized}
        isPremiumUser={isPremiumUser}
        currentUserId={currentUserId}
        sellerLoyaltyPointsBalance={sellerLoyaltyPointsBalance}
        sellerLoyaltyPointsReserved={sellerLoyaltyPointsReserved}
        onRequestLoginAddToCart={onRequestLoginAddToCart}
        showAddToCartOnCard={false}
        catalogSentinelRef={catalogSentinelRef}
        catalogHasMore={catalogHasMore}
        isCatalogLoadingMore={isCatalogLoadingMore}
        catalogLoadMoreError={catalogLoadMoreError}
        onRetryCatalogLoadMore={onRetryCatalogLoadMore}
        myProductsModerationFilter={myProductsModerationFilter}
        catalogFollowingOnly={catalogFollowingOnly}
        catalogAuctionOnly={catalogAuctionOnly}
        catalogInstallmentOnly={catalogInstallmentOnly}
        catalogSaleOnly={catalogSaleOnly}
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={onToggleRaffleParticipation}
        raffleParticipationPendingProductId={raffleParticipationPendingProductId}
      />
    </>
  );
}

/**
 * @param {{
 *   isCatalogBrowserLanding: boolean;
 *   categoryDisplays: import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[];
 *   isAdmin: boolean;
 *   categoryDisplaysStatus: { kind: string; message?: string };
 *   onFeedTileClick: (tile: import('../../../entities/product-category-display/model/types.js').CatalogFeedTile) => void;
 *   onCategoryClick: (slug: import('../../../entities/product/model/types.js').ProductCategory) => void;
 *   onEditCategoryClick: (slug: import('../../../entities/product/model/types.js').ProductCategory) => void;
 *   selectedCategoryLabel: string | null;
 *   activeCatalogFeedLabel: string | null;
 *   onBackToCatalogLanding: () => void;
 *   catalogGridSectionProps: import('./HomePageCatalogGridSection.jsx').HomePageCatalogGridSection extends never ? never : Parameters<typeof HomePageCatalogGridSection>[0];
 * }} props
 */
export function HomePageCatalogSection({
  isCatalogBrowserLanding,
  categoryDisplays,
  isAdmin,
  categoryDisplaysStatus,
  onFeedTileClick,
  onCategoryClick,
  onEditCategoryClick,
  selectedCategoryLabel,
  activeCatalogFeedLabel,
  onBackToCatalogLanding,
  catalogGridSectionProps,
}) {
  if (isCatalogBrowserLanding) {
    return (
      <CatalogBrowserLanding
        displays={categoryDisplays}
        isAdmin={isAdmin}
        isLoading={categoryDisplaysStatus.kind === "loading"}
        errorMessage={
          categoryDisplaysStatus.kind === "error"
            ? categoryDisplaysStatus.message
            : null
        }
        onFeedTileClick={onFeedTileClick}
        onCategoryClick={onCategoryClick}
        onEditCategoryClick={onEditCategoryClick}
      />
    );
  }

  const breadcrumbCurrentLabel =
    selectedCategoryLabel ?? activeCatalogFeedLabel;

  return (
    <>
      <div className="catalog-categories-browser__toolbar">
        <nav
          className="catalog-categories-browser__breadcrumb"
          aria-label={HOME_PAGE_UI.BREADCRUMB_CATALOG}
        >
          <button
            type="button"
            className="catalog-categories-browser__breadcrumb-link"
            onClick={onBackToCatalogLanding}
          >
            {HOME_PAGE_UI.BREADCRUMB_CATALOG}
          </button>
          {breadcrumbCurrentLabel ? (
            <>
              <span className="home-page__breadcrumb-sep" aria-hidden="true">
                {HOME_PAGE_UI.BREADCRUMB_SEPARATOR}
              </span>
              <span className="catalog-categories-browser__breadcrumb-current">
                {breadcrumbCurrentLabel}
              </span>
            </>
          ) : null}
        </nav>
        <button
          type="button"
          className="catalog-categories-browser__all-button"
          onClick={onBackToCatalogLanding}
        >
          {HOME_PAGE_UI.BACK_TO_CATALOG_LANDING}
        </button>
      </div>
      <HomePageCatalogGridSection {...catalogGridSectionProps} />
    </>
  );
}
