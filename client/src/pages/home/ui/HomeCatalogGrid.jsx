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
 *   myProductsCatalogError: string;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onSetMyProductAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   togglingAvailabilityProductId: string | null;
 *   isAuthorized: boolean;
 *   onRequestLoginAddToCart: () => void;
 *   catalogSentinelRef: import('react').RefObject<HTMLDivElement | null>;
 *   catalogHasMore: boolean;
 *   isCatalogLoadingMore: boolean;
 *   catalogLoadMoreError: string | null;
 *   onRetryCatalogLoadMore: () => void;
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
  myProductsCatalogError,
  onOpenProductDetails,
  onSetMyProductAvailability,
  togglingAvailabilityProductId,
  isAuthorized,
  onRequestLoginAddToCart,
  catalogSentinelRef,
  catalogHasMore,
  isCatalogLoadingMore,
  catalogLoadMoreError,
  onRetryCatalogLoadMore,
}) {
  const emptyMessage = (() => {
    if (products.length > 0) return "";
    if (hasQuery) return HOME_PAGE_UI.EMPTY_BY_QUERY;
    if (isMineMode) {
      return selectedProductCategory
        ? HOME_PAGE_UI.EMPTY_MY_FILTERED
        : HOME_PAGE_UI.EMPTY_MY_PRODUCTS;
    }
    if (selectedProductCategory) return HOME_PAGE_UI.EMPTY_CATEGORY;
    return HOME_PAGE_UI.EMPTY_NO_PRODUCTS;
  })();

  return (
    <>
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
                  isAvailabilityTogglePending={
                    togglingAvailabilityProductId === String(product._id)
                  }
                  onOpenDetails={onOpenProductDetails}
                  isAuthorized={isAuthorized}
                  onRequestLoginAddToCart={onRequestLoginAddToCart}
                  isMineMode={isMineMode}
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
