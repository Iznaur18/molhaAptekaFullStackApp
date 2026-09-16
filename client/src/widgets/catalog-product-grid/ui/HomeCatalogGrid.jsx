import { useCallback, useMemo } from "react";
import { splitCatalogNearProducts } from "@molha/api-contract";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { InlineErrorBanner } from "../../../shared/ui/InlineErrorBanner/InlineErrorBanner.jsx";
import { shouldShowProductTier3BannerFullWidth } from "../../../entities/product/lib/shouldShowProductTier3BannerFullWidth.js";
import { resolveClientViewerRegionCode } from "../../../entities/region/lib/viewerRegion.js";
import { interleaveCatalogTier3Banners } from "../lib/interleaveCatalogTier3Banners.js";
import { useCatalogGridColumnCount } from "../model/useCatalogGridColumnCount.js";
import { CatalogGridBlocks } from "./CatalogGridBlocks.jsx";
import { CatalogGridSkeleton } from "./CatalogGridSkeleton.jsx";
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
 *   showAddToCart?: boolean;
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
 *   catalogRentalOnly?: boolean;
 *   catalogAffiliateOnly?: boolean;
 *   catalogWholesaleOnly?: boolean;
 *   catalogOriginalOnly?: boolean;
 *   catalogNear?: boolean;
 *   showFullWidthTier3Banners?: boolean;
 *   viewerRegionCode?: string | null;
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
  showAddToCart = false,
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
  catalogRentalOnly = false,
  catalogAffiliateOnly = false,
  catalogWholesaleOnly = false,
  catalogOriginalOnly = false,
  catalogNear = false,
  showFullWidthTier3Banners = false,
  viewerRegionCode = null,
  highlightRaffleProducts = false,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  raffleParticipationPendingProductId = null,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
}) {
  const resolvedViewerRegionCode =
    typeof viewerRegionCode === "string" && viewerRegionCode.trim()
      ? viewerRegionCode.trim()
      : resolveClientViewerRegionCode(null);
  const shouldInterleaveTier3Banners = showFullWidthTier3Banners && !isMineMode;

  const nearSplit = useMemo(() => {
    if (!catalogNear || isMineMode) {
      return null;
    }
    return splitCatalogNearProducts(products);
  }, [catalogNear, isMineMode, products]);

  const hasNearRegionSection = Boolean(
    nearSplit && nearSplit.withoutDistance.length > 0,
  );

  const columnCount = useCatalogGridColumnCount(null, true);
  const displayProducts = useMemo(
    () =>
      interleaveCatalogTier3Banners(products, columnCount, {
        enabled: shouldInterleaveTier3Banners,
      }),
    [columnCount, products, shouldInterleaveTier3Banners],
  );

  const nearDisplaySplit = useMemo(() => {
    if (!hasNearRegionSection) {
      return null;
    }
    return splitCatalogNearProducts(displayProducts);
  }, [displayProducts, hasNearRegionSection]);

  // Стабильные: от них зависит нарезка ленты на блоки (CatalogGridBlocks).
  const getProductKey = useCallback((product) => String(product._id), []);
  const isFullWidthProduct = useCallback(
    (product) =>
      shouldShowProductTier3BannerFullWidth(product, {
        isMineMode,
        showFullWidthTier3Banners,
      }),
    [isMineMode, showFullWidthTier3Banners],
  );

  const cardProps = {
    // Только в «Моих товарах» (проверка перерасхода баллов): в ленте новый
    // массив на каждой догруженной странице перерисовывал бы все карточки (memo).
    products: isMineMode ? products : undefined,
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
    showAddToCart,
    highlightRaffleProducts,
    sellerRaffleActive,
    onToggleRaffleParticipation,
    raffleParticipationPendingProductId,
    sellerLoyaltyPointsBalance,
    sellerLoyaltyPointsReserved,
    viewerRegionCode: resolvedViewerRegionCode,
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
    if (!isMineMode && catalogRentalOnly) {
      return HOME_PAGE_UI.EMPTY_RENTAL_FILTER;
    }
    if (!isMineMode && catalogAffiliateOnly) {
      return HOME_PAGE_UI.EMPTY_AFFILIATE_FILTER;
    }
    if (!isMineMode && catalogWholesaleOnly) {
      return HOME_PAGE_UI.EMPTY_WHOLESALE_FILTER;
    }
    if (!isMineMode && catalogOriginalOnly) {
      return HOME_PAGE_UI.EMPTY_ORIGINAL_FILTER;
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
      promotionFullWidth={isFullWidthProduct(product)}
      {...cardProps}
    />
  );

  /**
   * @param {import('../../../entities/product/model/types.js').ProductFromApi[]} items
   * @param {{ ariaLabel: string; keyPrefix: string }} options
   */
  const renderBlocks = (items, { ariaLabel, keyPrefix }) => (
    <CatalogGridBlocks
      items={items}
      columnCount={columnCount}
      renderItem={renderProductCard}
      getItemKey={getProductKey}
      isFullWidth={isFullWidthProduct}
      keyPrefix={keyPrefix}
      ariaLabel={ariaLabel}
    />
  );

  return (
    <>
      {myProductsCatalogNotice ? (
        <p className="app-shell__state app-shell__state_notice" role="status">
          {myProductsCatalogNotice}
        </p>
      ) : null}
      {myProductsCatalogError ? (
        <InlineErrorBanner>{myProductsCatalogError}</InlineErrorBanner>
      ) : null}
      {products.length === 0 ? (
        <p className="app-shell__state">{emptyMessage}</p>
      ) : (
        <>
          {nearDisplaySplit ? (
            <>
              {nearDisplaySplit.withDistance.length > 0
                ? renderBlocks(nearDisplaySplit.withDistance, {
                    ariaLabel: HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA,
                    keyPrefix: "near-",
                  })
                : null}
              <h2 className="app-shell__catalog-near-region-title">
                {HOME_PAGE_UI.NEAR_REGION_SECTION}
              </h2>
              {renderBlocks(nearDisplaySplit.withoutDistance, {
                ariaLabel: HOME_PAGE_UI.NEAR_REGION_SECTION,
                keyPrefix: "region-",
              })}
            </>
          ) : (
            renderBlocks(displayProducts, {
              ariaLabel: HOME_PAGE_UI.CATALOG_PRODUCTS_LIST_ARIA,
              keyPrefix: "",
            })
          )}
          {isCatalogLoadingMore ? (
            // Два ряда карточек-скелетонов вместо текста «Подгружаем…».
            <CatalogGridSkeleton
              cardCount={columnCount * 2}
              ariaLabel={HOME_PAGE_UI.CATALOG_LOADING_MORE}
              withActionButton={showAddToCart && !isMineMode}
            />
          ) : null}
          {catalogLoadMoreError ? (
            <div className="app-shell__catalog-more app-shell__catalog-more_error">
              <InlineErrorBanner>
                {HOME_PAGE_UI.CATALOG_LOAD_MORE_FAIL}: {catalogLoadMoreError}
              </InlineErrorBanner>
              <button
                type="button"
                className="app-shell__catalog-retry"
                onClick={onRetryCatalogLoadMore}
              >
                {HOME_PAGE_UI.CATALOG_LOAD_MORE_RETRY}
              </button>
            </div>
          ) : null}
          {catalogHasMore && !catalogLoadMoreError ? (
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
