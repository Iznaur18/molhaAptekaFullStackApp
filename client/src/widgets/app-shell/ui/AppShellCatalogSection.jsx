import { useNavigate } from "react-router-dom";

import { HomeCuratedProductListsSection } from "../../../entities/curated-product-list/ui/HomeCuratedProductListsSection.jsx";
import { CuratedProductListCarouselSkeleton } from "../../../entities/curated-product-list/ui/CuratedProductListCarouselSkeleton.jsx";
import { RaffleFeaturedCarousel } from "../../../entities/raffle/ui/RaffleFeaturedCarousel.jsx";
import { UserStoriesStrip } from "../../../entities/user-story/ui/UserStoriesStrip.jsx";
import { CatalogCityFilterBanner } from "../../../entities/product/ui/CatalogCityFilterBanner.jsx";
import { CatalogBrowserLanding } from "../../../entities/product-category-display/ui/CatalogBrowserLanding.jsx";
import { CatalogSubcategoryPicker } from "../../../entities/product-category-display/ui/CatalogSubcategoryPicker.jsx";
import { buildRafflePath } from "../../../shared/lib/rafflePaths.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { CatalogGridSkeleton } from "../../catalog-product-grid/ui/CatalogGridSkeleton.jsx";
import { HomeCatalogGrid } from "../../catalog-product-grid/ui/HomeCatalogGrid.jsx";

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
 *   catalogMainView: string;
 *   activeCatalogBrowserCategory: string | null;
 *   selectedProductCategory: string | null;
 *   hasProductSearchQuery: boolean;
 *   isMineMode: boolean;
 *   deletingProductId: string | null;
 *   onDeleteMyProduct: (productId: string) => void;
 *   onEditMyProduct: (product: ProductFromApi) => void;
 *   onPromoteMyProduct: (product: ProductFromApi) => void;
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
 *   showCatalogCityFilterBanner?: boolean;
 *   catalogCityFilterLabel?: string | null;
 *   onShowAllCatalogCities?: () => void;
 *   showFullWidthTier3Banners?: boolean;
 *   sellerRaffleActive: boolean;
 *   onToggleRaffleParticipation: (productId: string, participate: boolean) => void;
 *   raffleParticipationPendingProductId: string | null;
 *   homeCuratedProductLists: import('../../../entities/curated-product-list/model/types.js').HomeCuratedProductListFromApi[];
 *   showCuratedProductLists: boolean;
 *   isCuratedProductListsLoading: boolean;
 * }} props
 */
export function AppShellCatalogGridSection({
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
  catalogMainView,
  activeCatalogBrowserCategory,
  selectedProductCategory,
  hasProductSearchQuery,
  isMineMode,
  deletingProductId,
  onDeleteMyProduct,
  onEditMyProduct,
  onPromoteMyProduct,
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
  showCatalogCityFilterBanner = false,
  catalogCityFilterLabel = null,
  onShowAllCatalogCities,
  showFullWidthTier3Banners = false,
  sellerRaffleActive,
  onToggleRaffleParticipation,
  raffleParticipationPendingProductId,
  homeCuratedProductLists,
  showCuratedProductLists,
  isCuratedProductListsLoading = false,
}) {
  const navigate = useNavigate();

  const isCatalogInitialLoading =
    catalogStatus.kind === "loading" && products.length === 0;

  if (catalogStatus.kind === "error") {
    return (
      <p className="app-shell__state app-shell__state_error" role="alert">
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
      {isHomeCatalogMainView ? (
        <UserStoriesStrip
          rings={userStoriesFeed.rings}
          canPublish={userStoriesFeed.canPublish}
          showStrip={userStoriesFeed.showStrip}
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onRefresh={onUserStoriesRefresh}
          onOpenProfile={onSellerNameClick}
          onRequestLogin={onRequestLoginAddToCart}
        />
      ) : null}
      {showCuratedProductLists && homeCuratedProductLists.length > 0 ? (
        <HomeCuratedProductListsSection
          lists={homeCuratedProductLists}
          onOpenProduct={onOpenProductDetails}
        />
      ) : showCuratedProductLists && isCuratedProductListsLoading ? (
        <CuratedProductListCarouselSkeleton />
      ) : null}
      {showCatalogCityFilterBanner && catalogCityFilterLabel && onShowAllCatalogCities ? (
        <CatalogCityFilterBanner
          cityLabel={catalogCityFilterLabel}
          onShowAllCities={onShowAllCatalogCities}
        />
      ) : null}
      {isCatalogInitialLoading ? (
        <CatalogGridSkeleton />
      ) : (
        <HomeCatalogGrid
          products={products}
          selectedProductCategory={
            catalogMainView === "catalog-browser"
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
          showFullWidthTier3Banners={showFullWidthTier3Banners}
          sellerRaffleActive={sellerRaffleActive}
          onToggleRaffleParticipation={onToggleRaffleParticipation}
          raffleParticipationPendingProductId={raffleParticipationPendingProductId}
        />
      )}
    </>
  );
}

/**
 * @param {{
 *   isCatalogBrowserLanding: boolean;
 *   isCatalogSubcategoryPickerActive: boolean;
 *   subcategoryPickerTrail: Array<{ id: string; labelRu: string }>;
 *   subcategoryPickerLoadError: string | null;
 *   resolvingLandingCategoryKey: string | null;
 *   resolvingPickerCategoryId: string | null;
 *   onSubcategoryPickerBack: () => void;
 *   onSubcategoryPickerViewAll: (categoryId: string) => void;
 *   onSubcategoryPickerCategoryClick: (node: import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode) => void;
 *   onEditCategoryNodeClick: (payload: { categoryId: string; fallbackLabel: string }) => void;
 *   categoryRoots: import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode[];
 *   categoryDisplays: import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[];
 *   feedTileDisplays: import('../../../entities/product-category-display/model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   isAdmin: boolean;
 *   categoryDisplaysStatus: { kind: string; message?: string };
 *   onFeedTileClick: (tile: import('../../../entities/product-category-display/lib/buildCatalogFeedTiles.js').CatalogFeedTile) => void;
 *   onCategoryClick: (item: import('../../../entities/product-category-display/model/types.js').ResolvedProductCategoryDisplay) => void;
 *   onEditCategoryClick: (slug: import('../../../entities/product/model/types.js').ProductCategory) => void;
 *   onEditFeedTileClick: (tileKey: string) => void;
 *   selectedCategoryLabel: string | null;
 *   activeCatalogFeedLabel: string | null;
 *   catalogGridSectionProps: import('./AppShellCatalogSection.jsx').AppShellCatalogGridSection extends never ? never : Parameters<typeof AppShellCatalogGridSection>[0];
 * }} props
 */
export function AppShellCatalogSection({
  isCatalogBrowserLanding,
  isCatalogSubcategoryPickerActive = false,
  subcategoryPickerTrail = [],
  subcategoryPickerLoadError = null,
  resolvingLandingCategoryKey = null,
  resolvingPickerCategoryId = null,
  onSubcategoryPickerBack,
  onSubcategoryPickerViewAll,
  onSubcategoryPickerCategoryClick,
  onEditCategoryNodeClick,
  categoryRoots,
  categoryDisplays,
  feedTileDisplays,
  isAdmin,
  categoryDisplaysStatus,
  onFeedTileClick,
  onCategoryClick,
  personalCategoryTiles = [],
  onPersonalCategoryClick,
  onEditCategoryClick,
  onEditFeedTileClick,
  selectedCategoryLabel,
  activeCatalogFeedLabel,
  catalogGridSectionProps,
}) {
  if (isCatalogSubcategoryPickerActive) {
    return (
      <CatalogSubcategoryPicker
        trail={subcategoryPickerTrail}
        displays={categoryDisplays}
        isAdmin={isAdmin}
        loadError={subcategoryPickerLoadError}
        resolvingCategoryId={resolvingPickerCategoryId}
        onBack={onSubcategoryPickerBack}
        onViewAll={onSubcategoryPickerViewAll}
        onCategoryClick={onSubcategoryPickerCategoryClick}
        onEditCategoryClick={onEditCategoryNodeClick}
      />
    );
  }

  if (isCatalogBrowserLanding) {
    return (
      <CatalogBrowserLanding
        displays={categoryDisplays}
        feedTileDisplays={feedTileDisplays}
        categoryRoots={categoryRoots}
        isAdmin={isAdmin}
        isLoading={categoryDisplaysStatus.kind === "loading"}
        errorMessage={
          categoryDisplaysStatus.kind === "error"
            ? categoryDisplaysStatus.message
            : null
        }
        onFeedTileClick={onFeedTileClick}
        onCategoryClick={onCategoryClick}
        personalCategoryTiles={personalCategoryTiles}
        onPersonalCategoryClick={onPersonalCategoryClick}
        onEditCategoryClick={onEditCategoryClick}
        pendingCategoryKey={resolvingLandingCategoryKey}
        onEditFeedTileClick={onEditFeedTileClick}
      />
    );
  }

  const breadcrumbCurrentLabel = selectedCategoryLabel ?? activeCatalogFeedLabel;

  return (
    <>
      {breadcrumbCurrentLabel ? (
        <div className="catalog-categories-browser__toolbar">
          <nav
            className="catalog-categories-browser__breadcrumb"
            aria-label={HOME_PAGE_UI.BREADCRUMB_CATALOG}
          >
            <span className="catalog-categories-browser__breadcrumb-current">
              {breadcrumbCurrentLabel}
            </span>
          </nav>
        </div>
      ) : null}
      <AppShellCatalogGridSection {...catalogGridSectionProps} />
    </>
  );
}
