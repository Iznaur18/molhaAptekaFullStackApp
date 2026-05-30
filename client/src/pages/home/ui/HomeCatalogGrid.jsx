import { ProductCard } from "../../../entities/product/ui/ProductCard.jsx";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   products: import('../../../entities/product/model/types.js').ProductFromApi[];
 *   selectedProductCategory: import('../../../entities/product/model/types.js').ProductCategory | null;
 *   hasQuery: boolean;
 *   isMineMode: boolean;
 *   deletingProductId: string | null;
 *   onSellerNameClick: (userId: string) => void;
 *   onDeleteMyProduct: (productId: string) => void;
 *   onEditMyProduct?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onPromoteMyProduct?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   pendingPromotionProductIds?: Set<string>;
 *   myProductsCatalogError: string;
 *   myProductsCatalogNotice?: string;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onSetMyProductAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   onSetMyProductAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
 *   togglingAvailabilityProductId: string | null;
 *   togglingAuctionProductId?: string | null;
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onRequestLoginAddToCart: () => void;
 *   showAddToCartOnCard?: boolean;
 *   catalogSentinelRef: import('react').RefObject<HTMLDivElement | null>;
 *   catalogHasMore: boolean;
 *   isCatalogLoadingMore: boolean;
 *   catalogLoadMoreError: string | null;
 *   onRetryCatalogLoadMore: () => void;
 *   myProductsModerationFilter?: string;
 *   catalogFollowingOnly?: boolean;
 *   catalogAuctionOnly?: boolean;
 *   catalogSaleOnly?: boolean;
 *   highlightRaffleProducts?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import('../../../entities/product/model/types.js').ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   raffleParticipationPendingProductId?: string | null;
 * }} props
 */
export function HomeCatalogGrid({
  products,
  selectedProductCategory,
  hasQuery,
  isMineMode,
  deletingProductId,
  onSellerNameClick,
  onDeleteMyProduct,
  onEditMyProduct,
  onPromoteMyProduct,
  pendingPromotionProductIds,
  myProductsCatalogError,
  myProductsCatalogNotice = "",
  onOpenProductDetails,
  onSetMyProductAvailability,
  onSetMyProductAuction,
  togglingAvailabilityProductId,
  togglingAuctionProductId = null,
  isAuthorized,
  currentUserId = null,
  onRequestLoginAddToCart,
  showAddToCartOnCard = true,
  catalogSentinelRef,
  catalogHasMore,
  isCatalogLoadingMore,
  catalogLoadMoreError,
  onRetryCatalogLoadMore,
  myProductsModerationFilter = "",
  catalogFollowingOnly = false,
  catalogAuctionOnly = false,
  catalogSaleOnly = false,
  highlightRaffleProducts = false,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  raffleParticipationPendingProductId = null,
}) {
  const pendingIds = pendingPromotionProductIds ?? new Set();

  const emptyMessage = (() => {
    if (products.length > 0) return "";
    if (hasQuery) return HOME_PAGE_UI.EMPTY_BY_QUERY;
    if (!isMineMode && catalogSaleOnly) {
      return HOME_PAGE_UI.EMPTY_SALE_FILTER;
    }
    if (!isMineMode && (catalogFollowingOnly || catalogAuctionOnly)) {
      return HOME_PAGE_UI.EMPTY_FOLLOWING_FILTER;
    }
    if (isMineMode) {
      if (myProductsModerationFilter) {
        return HOME_PAGE_UI.EMPTY_MY_BY_MODERATION_STATUS;
      }
      return selectedProductCategory
        ? HOME_PAGE_UI.EMPTY_MY_FILTERED
        : HOME_PAGE_UI.EMPTY_MY_PRODUCTS;
    }
    if (selectedProductCategory) return HOME_PAGE_UI.EMPTY_CATEGORY;
    return HOME_PAGE_UI.EMPTY_NO_PRODUCTS;
  })();

  return (
    <>
      {myProductsCatalogNotice ? (
        <p className="home-page__state home-page__state_notice" role="status">
          {myProductsCatalogNotice}
        </p>
      ) : null}
      {myProductsCatalogError ? (
        <p className="home-page__state home-page__state_error" role="alert">
          {myProductsCatalogError}
        </p>
      ) : null}
      {products.length === 0 ? (
        <p className="home-page__state">{emptyMessage}</p>
      ) : (
        <>
          <div className="home-page__grid" role="list">
            {products.map((product) => (
              <div
                key={product._id}
                className="home-page__cell"
                role="listitem"
              >
                <ProductCard
                  product={product}
                  onSellerNameClick={onSellerNameClick}
                  onDeleteProduct={isMineMode ? onDeleteMyProduct : undefined}
                  onEditProduct={isMineMode ? onEditMyProduct : undefined}
                  isDeletePending={deletingProductId === String(product._id)}
                  onSetProductAvailability={
                    isMineMode ? onSetMyProductAvailability : undefined
                  }
                  onSetProductAuction={
                    isMineMode ? onSetMyProductAuction : undefined
                  }
                  onPromoteProduct={isMineMode ? onPromoteMyProduct : undefined}
                  isAvailabilityTogglePending={
                    togglingAvailabilityProductId === String(product._id)
                  }
                  isAuctionTogglePending={
                    togglingAuctionProductId === String(product._id)
                  }
                  onOpenDetails={onOpenProductDetails}
                  isAuthorized={isAuthorized}
                  currentUserId={currentUserId}
                  onRequestLoginAddToCart={onRequestLoginAddToCart}
                  showAddToCartOnCard={showAddToCartOnCard}
                  isMineMode={isMineMode}
                  highlightCatalogPromotion={!isMineMode}
                  isPromotionPending={
                    isMineMode &&
                    product._id != null &&
                    pendingIds.has(String(product._id))
                  }
                  highlightRaffleProduct={highlightRaffleProducts}
                  sellerRaffleActive={isMineMode ? sellerRaffleActive : false}
                  onToggleRaffleParticipation={
                    isMineMode ? onToggleRaffleParticipation : undefined
                  }
                  isRaffleParticipationPending={
                    isMineMode &&
                    product._id != null &&
                    raffleParticipationPendingProductId === String(product._id)
                  }
                />
              </div>
            ))}
          </div>
          {isCatalogLoadingMore ? (
            <p className="home-page__catalog-more home-page__state">
              {HOME_PAGE_UI.CATALOG_LOADING_MORE}
            </p>
          ) : null}
          {catalogLoadMoreError ? (
            <div className="home-page__catalog-more home-page__catalog-more_error">
              <p className="home-page__state home-page__state_error" role="alert">
                {HOME_PAGE_UI.CATALOG_LOAD_MORE_FAIL}: {catalogLoadMoreError}
              </p>
              <button
                type="button"
                className="home-page__catalog-retry"
                onClick={onRetryCatalogLoadMore}
              >
                {HOME_PAGE_UI.CATALOG_LOAD_MORE_RETRY}
              </button>
            </div>
          ) : null}
          {catalogHasMore && !catalogLoadMoreError ? (
            <div
              ref={catalogSentinelRef}
              className="home-page__catalog-sentinel"
              aria-hidden
            />
          ) : null}
        </>
      )}
    </>
  );
}
