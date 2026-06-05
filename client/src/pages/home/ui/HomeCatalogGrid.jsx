import { useMemo, useRef } from "react";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { isProductTier3BannerPromotion } from "../../../entities/product/lib/isProductTier3BannerPromotion.js";
import { CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT } from "../lib/catalogGridVirtualizationConstants.js";
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
 *   showAddToCartOnCard?: boolean;
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
  showAddToCartOnCard = true,
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

  const { tier3BannerProducts, gridProducts } = useMemo(() => {
    if (!showFullWidthTier3Banners || isMineMode) {
      return { tier3BannerProducts: [], gridProducts: products };
    }
    const banners = products.filter((product) => isProductTier3BannerPromotion(product));
    const rest = products.filter((product) => !isProductTier3BannerPromotion(product));
    return { tier3BannerProducts: banners, gridProducts: rest };
  }, [isMineMode, products, showFullWidthTier3Banners]);

  const shouldVirtualize = gridProducts.length > CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT;
  const columnCount = useCatalogGridColumnCount(virtualHostRef, shouldVirtualize);
  const virtualWindow = useCatalogGridVirtualizer({
    enabled: shouldVirtualize,
    hostRef: virtualHostRef,
    gridRef: virtualGridRef,
    itemCount: gridProducts.length,
    columnCount,
  });

  const visibleProducts = useMemo(() => {
    if (!shouldVirtualize) {
      return gridProducts;
    }
    return gridProducts.slice(virtualWindow.startIndex, virtualWindow.endIndex + 1);
  }, [gridProducts, shouldVirtualize, virtualWindow.endIndex, virtualWindow.startIndex]);

  const cardProps = {
    products: gridProducts,
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
    showAddToCartOnCard,
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

  const renderProductCard = (product, { promotionFullWidth = false } = {}) => (
    <CatalogGridProductCard
      key={product._id}
      product={product}
      promotionFullWidth={promotionFullWidth}
      {...cardProps}
    />
  );

  const gridNodes = visibleProducts.map((product) => renderProductCard(product));
  const tier3BannerNodes = tier3BannerProducts.map((product) =>
    renderProductCard(product, { promotionFullWidth: true }),
  );

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
          {tier3BannerNodes.length > 0 ? (
            <div
              className="home-page__grid home-page__grid--tier3-banners"
              role="list"
              aria-label={HOME_PAGE_UI.CATALOG_PROMOTED_BANNERS_ARIA}
            >
              {tier3BannerNodes}
            </div>
          ) : null}
          {shouldVirtualize ? (
            <div
              ref={virtualHostRef}
              className="home-page__grid-virtual-host"
              style={{ height: `${virtualWindow.totalHeight}px` }}
            >
              <div
                ref={virtualGridRef}
                className="home-page__grid home-page__grid--virtual-window"
                role="list"
                aria-label={HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA}
                style={{ top: `${virtualWindow.offsetTop}px` }}
              >
                {gridNodes}
              </div>
              {catalogHasMore && !catalogLoadMoreError ? (
                <div
                  ref={catalogSentinelRef}
                  className="home-page__catalog-sentinel home-page__catalog-sentinel_virtual"
                  aria-hidden
                />
              ) : null}
            </div>
          ) : (
            <div
              className="home-page__grid"
              role="list"
              aria-label={HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA}
            >
              {gridNodes}
            </div>
          )}
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
          {!shouldVirtualize && catalogHasMore && !catalogLoadMoreError ? (
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
