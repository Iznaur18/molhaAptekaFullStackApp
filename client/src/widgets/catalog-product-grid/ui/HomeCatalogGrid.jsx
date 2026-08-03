import { useMemo, useRef } from "react";
import { splitCatalogNearProducts } from "@molha/api-contract";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { shouldShowProductTier3BannerFullWidth } from "../../../entities/product/lib/shouldShowProductTier3BannerFullWidth.js";
import { CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT } from "../lib/catalogGridVirtualizationConstants.js";
import { interleaveCatalogTier3Banners } from "../lib/interleaveCatalogTier3Banners.js";
import { useCatalogGridColumnCount } from "../model/useCatalogGridColumnCount.js";
import { useCatalogGridVirtualizer } from "../model/useCatalogGridVirtualizer.js";
import { CatalogGridProductCard } from "./CatalogGridProductCard.jsx";

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
 *   myProductsCatalogError: string;
 *   myProductsCatalogNotice?: string;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onSetMyProductAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   onSetMyProductAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
 *   togglingAvailabilityProductId: string | null;
 *   togglingAuctionProductId?: string | null;
 *   isAuthorized: boolean;
 *   isPremiumUser?: boolean;
 *   currentUserId?: string | null;
 *   onRequestLoginAddToCart: () => void;
 *   catalogSentinelRef: import('react').RefObject<HTMLDivElement | null>;
 *   catalogHasMore: boolean;
 *   isCatalogLoadingMore: boolean;
 *   catalogLoadMoreError: string | null;
 *   onRetryCatalogLoadMore: () => void;
 *   myProductsModerationFilter?: string;
 *   catalogFollowingOnly?: boolean;
 *   catalogAuctionOnly?: boolean;
 *   catalogInstallmentOnly?: boolean;
 *   catalogSaleOnly?: boolean;
 *   catalogNear?: boolean;
 *   showFullWidthTier3Banners?: boolean;
 *   highlightRaffleProducts?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import('../../../entities/product/model/types.js').ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   raffleParticipationPendingProductId?: string | null;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
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
  myProductsCatalogError,
  myProductsCatalogNotice = "",
  onOpenProductDetails,
  onSetMyProductAvailability,
  onSetMyProductAuction,
  togglingAvailabilityProductId,
  togglingAuctionProductId = null,
  isAuthorized,
  isPremiumUser = false,
  currentUserId = null,
  onRequestLoginAddToCart,
  catalogSentinelRef,
  catalogHasMore,
  isCatalogLoadingMore,
  catalogLoadMoreError,
  onRetryCatalogLoadMore,
  myProductsModerationFilter = "",
  catalogFollowingOnly = false,
  catalogAuctionOnly = false,
  catalogInstallmentOnly = false,
  catalogSaleOnly = false,
  catalogNear = false,
  showFullWidthTier3Banners = false,
  highlightRaffleProducts = false,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  raffleParticipationPendingProductId = null,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
}) {
  const virtualHostRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const virtualGridRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const gridMeasureRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const shouldInterleaveTier3Banners = showFullWidthTier3Banners && !isMineMode;

  const hasTier3BannerInFeed = useMemo(
    () =>
      products.some((product) =>
        shouldShowProductTier3BannerFullWidth(product, {
          isMineMode,
          showFullWidthTier3Banners,
        }),
      ),
    [isMineMode, products, showFullWidthTier3Banners],
  );

  const nearSplit = useMemo(() => {
    if (!catalogNear || isMineMode) {
      return null;
    }
    return splitCatalogNearProducts(products);
  }, [catalogNear, isMineMode, products]);

  const hasNearRegionSection = Boolean(
    nearSplit && nearSplit.withoutDistance.length > 0,
  );

  const shouldVirtualize =
    !hasTier3BannerInFeed &&
    !hasNearRegionSection &&
    products.length > CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT;
  const shouldMeasureGridColumns = shouldVirtualize || shouldInterleaveTier3Banners;
  const gridColumnMeasureRef = shouldVirtualize ? virtualHostRef : gridMeasureRef;
  const columnCount = useCatalogGridColumnCount(
    gridColumnMeasureRef,
    shouldMeasureGridColumns,
  );
  const displayProducts = useMemo(
    () =>
      interleaveCatalogTier3Banners(products, columnCount, {
        enabled: shouldInterleaveTier3Banners,
      }),
    [columnCount, products, shouldInterleaveTier3Banners],
  );
  const virtualWindow = useCatalogGridVirtualizer({
    enabled: shouldVirtualize,
    hostRef: virtualHostRef,
    gridRef: virtualGridRef,
    itemCount: displayProducts.length,
    columnCount,
  });

  const visibleProducts = useMemo(() => {
    if (!shouldVirtualize) {
      return displayProducts;
    }
    return displayProducts.slice(virtualWindow.startIndex, virtualWindow.endIndex + 1);
  }, [
    displayProducts,
    shouldVirtualize,
    virtualWindow.endIndex,
    virtualWindow.startIndex,
  ]);

  const nearDisplaySplit = useMemo(() => {
    if (!hasNearRegionSection) {
      return null;
    }
    return splitCatalogNearProducts(displayProducts);
  }, [displayProducts, hasNearRegionSection]);

  const cardProps = {
    products,
    isMineMode,
    deletingProductId,
    onSellerNameClick,
    onDeleteMyProduct,
    onEditMyProduct,
    onPromoteMyProduct,
    onOpenProductDetails,
    onSetMyProductAvailability,
    onSetMyProductAuction,
    togglingAvailabilityProductId,
    togglingAuctionProductId,
    isAuthorized,
    isPremiumUser,
    currentUserId,
    onRequestLoginAddToCart,
    highlightRaffleProducts,
    sellerRaffleActive,
    onToggleRaffleParticipation,
    raffleParticipationPendingProductId,
    sellerLoyaltyPointsBalance,
    sellerLoyaltyPointsReserved,
  };

  const emptyMessage = (() => {
    if (products.length > 0) return "";
    if (hasQuery) return HOME_PAGE_UI.EMPTY_BY_QUERY;
    if (!isMineMode && catalogNear) {
      return HOME_PAGE_UI.EMPTY_NEAR_FILTER;
    }
    if (!isMineMode && catalogSaleOnly) {
      return HOME_PAGE_UI.EMPTY_SALE_FILTER;
    }
    if (!isMineMode && catalogInstallmentOnly) {
      return HOME_PAGE_UI.EMPTY_INSTALLMENT_FILTER;
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

  const renderProductCard = (product) => (
    <CatalogGridProductCard
      key={product._id}
      product={product}
      promotionFullWidth={shouldShowProductTier3BannerFullWidth(product, {
        isMineMode,
        showFullWidthTier3Banners,
      })}
      {...cardProps}
    />
  );

  const gridNodes = visibleProducts.map((product) => renderProductCard(product));

  return (
    <>
      {myProductsCatalogNotice ? (
        <p className="app-shell__state app-shell__state_notice" role="status">
          {myProductsCatalogNotice}
        </p>
      ) : null}
      {myProductsCatalogError ? (
        <p className="app-shell__state app-shell__state_error" role="alert">
          {myProductsCatalogError}
        </p>
      ) : null}
      {products.length === 0 ? (
        <p className="app-shell__state">{emptyMessage}</p>
      ) : (
        <>
          {shouldVirtualize ? (
            <div
              ref={virtualHostRef}
              className="app-shell__grid-virtual-host"
              style={{ height: `${virtualWindow.totalHeight}px` }}
            >
              <div
                ref={virtualGridRef}
                className="app-shell__grid app-shell__grid--virtual-window"
                role="list"
                aria-label={HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA}
                style={{ top: `${virtualWindow.offsetTop}px` }}
              >
                {gridNodes}
              </div>
              {catalogHasMore && !catalogLoadMoreError ? (
                <div
                  ref={catalogSentinelRef}
                  className="app-shell__catalog-sentinel app-shell__catalog-sentinel_virtual"
                  aria-hidden
                />
              ) : null}
            </div>
          ) : nearDisplaySplit ? (
            <div ref={gridMeasureRef}>
              {nearDisplaySplit.withDistance.length > 0 ? (
                <div
                  className="app-shell__grid"
                  role="list"
                  aria-label={HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA}
                >
                  {nearDisplaySplit.withDistance.map((product) =>
                    renderProductCard(product),
                  )}
                </div>
              ) : null}
              <h2 className="app-shell__catalog-near-region-title">
                {HOME_PAGE_UI.NEAR_REGION_SECTION}
              </h2>
              <div
                className="app-shell__grid"
                role="list"
                aria-label={HOME_PAGE_UI.NEAR_REGION_SECTION}
              >
                {nearDisplaySplit.withoutDistance.map((product) =>
                  renderProductCard(product),
                )}
              </div>
            </div>
          ) : (
            <div
              ref={gridMeasureRef}
              className="app-shell__grid"
              role="list"
              aria-label={HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA}
            >
              {gridNodes}
            </div>
          )}
          {isCatalogLoadingMore ? (
            <p className="app-shell__catalog-more app-shell__state">
              {HOME_PAGE_UI.CATALOG_LOADING_MORE}
            </p>
          ) : null}
          {catalogLoadMoreError ? (
            <div className="app-shell__catalog-more app-shell__catalog-more_error">
              <p className="app-shell__state app-shell__state_error" role="alert">
                {HOME_PAGE_UI.CATALOG_LOAD_MORE_FAIL}: {catalogLoadMoreError}
              </p>
              <button
                type="button"
                className="app-shell__catalog-retry"
                onClick={onRetryCatalogLoadMore}
              >
                {HOME_PAGE_UI.CATALOG_LOAD_MORE_RETRY}
              </button>
            </div>
          ) : null}
          {!shouldVirtualize && catalogHasMore && !catalogLoadMoreError ? (
            <div
              ref={catalogSentinelRef}
              className="app-shell__catalog-sentinel"
              aria-hidden
            />
          ) : null}
        </>
      )}
    </>
  );
}
