import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { InlineErrorBanner } from "../../../shared/ui/InlineErrorBanner/InlineErrorBanner.jsx";
import { isSellerProductLoyaltyPointsOvercommitted } from "../../../entities/product/lib/isSellerProductLoyaltyPointsOvercommitted.js";
import { MyProductCatalogCard } from "../../../entities/product/ui/MyProductCatalogCard.jsx";
import { CatalogGridSkeleton } from "../../catalog-product-grid/ui/CatalogGridSkeleton.jsx";

import "./MyProductsCatalogSection.css";

/**
 * Список «Мои товары» — 1 колонка compact-карточек (parity mobile MyProductsPage).
 *
 * @param {{
 *   catalogStatus: { kind: string; message?: string };
 *   products: import('../../../entities/product/model/types.js').ProductFromApi[];
 *   isAuthorized: boolean;
 *   isUserDataConfirmed?: boolean;
 *   deletingProductId: string | null;
 *   onEditMyProduct: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onCopyMyProduct: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onPromoteMyProduct: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   myProductsCatalogError: string;
 *   myProductsCatalogNotice?: string;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   togglingAvailabilityProductId: string | null;
 *   togglingAuctionProductId?: string | null;
 *   catalogSentinelRef: import('react').RefObject<HTMLElement | null>;
 *   catalogHasMore: boolean;
 *   isCatalogLoadingMore: boolean;
 *   catalogLoadMoreError: string | null;
 *   onRetryCatalogLoadMore: () => void;
 *   myProductsModerationFilter?: string;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   onPlaceProductClick?: () => void;
 * }} props
 */
export function MyProductsCatalogSection({
  catalogStatus,
  products,
  isAuthorized,
  isUserDataConfirmed = false,
  deletingProductId,
  onEditMyProduct,
  onCopyMyProduct,
  onPromoteMyProduct,
  myProductsCatalogError,
  myProductsCatalogNotice = "",
  onOpenProductDetails,
  togglingAvailabilityProductId,
  togglingAuctionProductId = null,
  catalogSentinelRef,
  catalogHasMore,
  isCatalogLoadingMore,
  catalogLoadMoreError,
  onRetryCatalogLoadMore,
  myProductsModerationFilter = "",
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  onPlaceProductClick,
}) {
  const isCatalogInitialLoading =
    catalogStatus.kind === "loading" && products.length === 0;

  if (catalogStatus.kind === "error" && products.length === 0) {
    return <InlineErrorBanner>{catalogStatus.message}</InlineErrorBanner>;
  }

  if (isCatalogInitialLoading) {
    return <CatalogGridSkeleton />;
  }

  const emptyMessage =
    myProductsModerationFilter !== ""
      ? HOME_PAGE_UI.EMPTY_MY_BY_MODERATION_STATUS
      : HOME_PAGE_UI.EMPTY_MY_PRODUCTS;

  const resolveLoyaltyOvercommitted = (product) =>
    isSellerProductLoyaltyPointsOvercommitted(product, {
      loyaltyPointsBalance: sellerLoyaltyPointsBalance,
      loyaltyPointsReserved: sellerLoyaltyPointsReserved,
      sellerProducts: products,
    });

  return (
    <div className="my-products-catalog-section">
      {myProductsCatalogNotice ? (
        <p className="my-products-catalog-section__notice" role="status">
          {myProductsCatalogNotice}
        </p>
      ) : null}
      {catalogStatus.kind === "error" && catalogStatus.message ? (
        <InlineErrorBanner>{catalogStatus.message}</InlineErrorBanner>
      ) : null}
      {myProductsCatalogError ? (
        <InlineErrorBanner>{myProductsCatalogError}</InlineErrorBanner>
      ) : null}

      {products.length === 0 ? (
        <div className="my-products-catalog-section__empty">
          <p className="my-products-catalog-section__empty-text">{emptyMessage}</p>
          {typeof onPlaceProductClick === "function" ? (
            <button
              type="button"
              className="app-btn app-btn--primary"
              onClick={onPlaceProductClick}
            >
              {HOME_PAGE_UI.LIST_PRODUCT_BUTTON}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="my-products-catalog-section__list">
          {products.map((product) => {
            const productId = String(product._id);
            return (
              <li key={productId} className="my-products-catalog-section__item">
                <MyProductCatalogCard
                  product={product}
                  isAuthorized={isAuthorized}
                  isUserDataConfirmed={isUserDataConfirmed}
                  isLoyaltyPointsOvercommitted={resolveLoyaltyOvercommitted(product)}
                  onOpenProduct={() => onOpenProductDetails(product)}
                  onEditProduct={() => onEditMyProduct(product)}
                  onCopyProduct={() => onCopyMyProduct(product)}
                  onPromoteProduct={() => onPromoteMyProduct(product)}
                  isDeletePending={deletingProductId === productId}
                  isAvailabilityTogglePending={
                    togglingAvailabilityProductId === productId
                  }
                  isAuctionTogglePending={togglingAuctionProductId === productId}
                />
              </li>
            );
          })}
        </ul>
      )}

      {catalogHasMore ? (
        <div
          ref={catalogSentinelRef}
          className="my-products-catalog-section__sentinel"
          aria-hidden="true"
        />
      ) : null}

      {isCatalogLoadingMore ? (
        <p className="my-products-catalog-section__loading" role="status">
          {HOME_PAGE_UI.CATALOG_LOADING_MORE}
        </p>
      ) : null}

      {catalogLoadMoreError ? (
        <div className="my-products-catalog-section__load-more-error">
          <InlineErrorBanner>{catalogLoadMoreError}</InlineErrorBanner>
          <button type="button" className="app-btn app-btn--ghost" onClick={onRetryCatalogLoadMore}>
            {HOME_PAGE_UI.CATALOG_LOAD_MORE_RETRY}
          </button>
        </div>
      ) : null}
    </div>
  );
}
