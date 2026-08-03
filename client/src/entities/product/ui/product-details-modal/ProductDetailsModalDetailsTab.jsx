import { useState } from "react";
import { createPortal } from "react-dom";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { useProductBadgeExplainsQuery } from "../../../product-badge-explain/model/useProductBadgeExplainsQuery.js";
import { resolveProductDetailsBadgeExplainRequest } from "../../../product-badge-explain/lib/resolveProductBadgeExplainSheet.js";
import { ProductBadgeExplainSheet } from "../../../product-badge-explain/ui/ProductBadgeExplainSheet.jsx";
import { getProductSellerId } from "../../lib/getProductSellerId.js";
import { ProductDetailsBadgeStack } from "../ProductDetailsBadgeStack.jsx";
import { ProductDetailsSellerPreview } from "../ProductDetailsSellerPreview.jsx";
import { ProductMediaGalleryReadonly } from "../ProductMediaGalleryReadonly.jsx";
import { ProductPriceDisplay } from "../ProductPriceDisplay.jsx";
import { ProductAffiliateShareButton } from "./ProductAffiliateShareButton.jsx";
import { ProductDetailsAuctionTeaser } from "./ProductDetailsAuctionTeaser.jsx";
import { ProductDetailsCompareTeaser } from "./ProductDetailsCompareTeaser.jsx";
import { ProductDetailsContentSwitcher } from "./ProductDetailsContentSwitcher.jsx";
import { ProductDetailsInstallmentTeaser } from "./ProductDetailsInstallmentTeaser.jsx";
import { ProductDetailsModalPurchaseActions } from "./ProductDetailsModalPurchaseActions.jsx";
import { ProductDetailsQaTeaser } from "./ProductDetailsQaTeaser.jsx";
import { ProductDetailsRaffleTeaser } from "./ProductDetailsRaffleTeaser.jsx";
import { ProductDetailsSaleTeaser } from "./ProductDetailsSaleTeaser.jsx";
import { ProductDetailsSellerProductsCarousel } from "./ProductDetailsSellerProductsCarousel.jsx";
import { ProductDetailsWholesaleOffer } from "./ProductDetailsWholesaleOffer.jsx";
import { renderProductDetailsFieldRows } from "./renderProductDetailsFieldRows.jsx";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   isPremiumUser?: boolean;
 *   onRequestLogin: () => void;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: { productWishlistCount?: number },
 *   ) => void;
 *   currentUserId?: string | null;
 *   mobileReportOverlay?: import('react').ReactNode;
 *   productTitleId?: string;
 *   embedMediaGallery?: boolean;
 *   showInlinePurchaseActions?: boolean;
 *   fullWidthCommerceFold?: boolean;
 *   splitRestHost?: HTMLElement | null;
 *   showSplitRest?: boolean;
 *   ctrl: ReturnType<import('./useProductDetailsModalController.js').useProductDetailsModalController>;
 * }} props
 */
export function ProductDetailsModalDetailsTab({
  product,
  isOpen,
  isAuthorized,
  isPremiumUser: _isPremiumUser = false,
  onRequestLogin,
  onProductStatsUpdate,
  currentUserId = null,
  mobileReportOverlay = null,
  productTitleId,
  embedMediaGallery = true,
  showInlinePurchaseActions = false,
  fullWidthCommerceFold = false,
  splitRestHost = null,
  showSplitRest = true,
  ctrl,
}) {
  const {
    imageUrls,
    previewVideoUrl,
    auctionUi,
    fieldHandlers,
    handleOpenSellerProfile,
    showPriceBlock,
    topStatFieldKeys,
    bottomMetaFieldKeys,
    contentPanels,
    hasDetailsSection,
    canShowAddToCart,
    purchaseLimit,
    handleAuctionShortcutClick,
    handleInstallmentShortcutClick,
    handleQaShortcutClick,
    handleCompareShortcutClick,
    isOwnProduct,
    showQaTab,
    showCompareTab,
  } = ctrl;

  /** @type {[null | { title: string; badgeKey: import("@izibuy/shared-lib").ProductBadgeExplainKey | null; fallbackKey: string }, Function]} */
  const [badgeExplain, setBadgeExplain] = useState(null);

  // Prefetch CMS бейджей, пока открыты детали — sheet не стартует с пустым cache.
  useProductBadgeExplainsQuery({ enabled: isOpen });

  const openBadgeExplain = (item) => {
    const request = resolveProductDetailsBadgeExplainRequest(item);
    if (!request) {
      return;
    }
    setBadgeExplain(request);
  };

  const sellerId = getProductSellerId(product) ?? "";
  const productId = String(product._id);
  const installmentEnabled = product.productInstallmentEnabled === true;

  const commerceBody = showPriceBlock ? (
    <>
      <ProductDetailsBadgeStack product={product} onBadgePress={openBadgeExplain} />
      <div className="product-details-modal__seller-extras">
        {sellerId ? (
          <ProductDetailsSellerProductsCarousel
            sellerId={sellerId}
            excludeProductId={productId}
          />
        ) : null}
        <div className="product-details-modal__feature-cards">
          <ProductDetailsQaTeaser
            visible={showQaTab && !isOwnProduct}
            onPress={handleQaShortcutClick}
          />
          <ProductDetailsCompareTeaser
            productId={productId}
            enabled={showCompareTab}
            onPress={handleCompareShortcutClick}
          />
          <ProductDetailsRaffleTeaser product={product} />
          <ProductAffiliateShareButton
            product={product}
            isAuthorized={isAuthorized}
            currentUserId={currentUserId}
            onRequestLogin={onRequestLogin}
          />
          {productId ? (
            <ProductDetailsInstallmentTeaser
              productId={productId}
              installmentEnabled={installmentEnabled}
              onPress={handleInstallmentShortcutClick}
            />
          ) : null}
          <ProductDetailsAuctionTeaser
            productId={productId}
            auctionActive={auctionUi.auctionActive}
            onPress={handleAuctionShortcutClick}
          />
          {sellerId && typeof handleOpenSellerProfile === "function" ? (
            <ProductDetailsSaleTeaser
              product={product}
              sellerId={sellerId}
              onOpenSeller={handleOpenSellerProfile}
            />
          ) : null}
        </div>
      </div>
    </>
  ) : null;

  const priceBlock = showPriceBlock ? (
    <div className="product-details-modal__price-block product-details-modal__price-block--inline-actions">
      <ProductPriceDisplay
        product={product}
        showLabel={false}
        className="product-details-modal__price-display"
        showDiscountBadge
        showLoyaltyBadge
        isAuthorized={isAuthorized}
        onDiscountBadgePress={openBadgeExplain}
        onLoyaltyBadgePress={openBadgeExplain}
      />
      {showInlinePurchaseActions ? (
        <ProductDetailsModalPurchaseActions
          productId={productId}
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          purchaseLimit={purchaseLimit}
          canShowAddToCart={canShowAddToCart}
        />
      ) : null}
      <ProductDetailsWholesaleOffer
        product={product}
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        canShowAddToCart={canShowAddToCart}
      />
      <h3 id={productTitleId} className="product-details-modal__product-name">
        {product.productName?.trim() || "Товар"}
      </h3>
      {!fullWidthCommerceFold ? commerceBody : null}
    </div>
  ) : null;

  const commerceFold =
    showPriceBlock && fullWidthCommerceFold ? (
      <div className="product-details-modal__commerce-fold">{commerceBody}</div>
    ) : null;

  const mediaGallery = (
    <ProductMediaGalleryReadonly
      imageUrls={imageUrls}
      previewVideoUrl={previewVideoUrl}
      isActive={isOpen}
      resetToken={product._id}
      onBack={fieldHandlers.onClose}
      heroOverlay={
        !isOwnProduct || mobileReportOverlay ? (
          <div className="product-media-gallery-readonly__hero-actions">
            {mobileReportOverlay ? (
              <div className="product-media-gallery-readonly__report-slot">
                {mobileReportOverlay}
              </div>
            ) : null}
            {!isOwnProduct ? (
              <WishlistToggleButton
                productId={productId}
                product={product}
                isAuthorized={isAuthorized}
                onRequestLogin={onRequestLogin}
                currentUserId={currentUserId}
                onProductStatsUpdate={onProductStatsUpdate}
                variant="card"
              />
            ) : null}
          </div>
        ) : null
      }
    />
  );

  const detailsBelow = (
    <div className="product-details-modal__below-fold">
      {hasDetailsSection ? (
        <section
          className="product-details-modal__details"
          aria-label={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
        >
          {contentPanels?.hasContentPanels ? (
            <ProductDetailsContentSwitcher
              product={product}
              contentPanels={contentPanels}
            />
          ) : null}
          {contentPanels && contentPanels.otherBlockFieldKeys.length > 0 ? (
            <dl className="product-details-modal__blocks">
              {renderProductDetailsFieldRows(
                product,
                contentPanels.otherBlockFieldKeys,
                fieldHandlers,
              )}
            </dl>
          ) : null}
        </section>
      ) : null}

      <ProductDetailsSellerPreview
        seller={product.productSeller}
        onOpenProfile={handleOpenSellerProfile}
      />

      {topStatFieldKeys.length > 0 ? (
        <dl className="product-details-modal__stats-grid product-details-modal__stats-grid--standalone">
          {renderProductDetailsFieldRows(product, topStatFieldKeys, fieldHandlers)}
        </dl>
      ) : null}

      {contentPanels && bottomMetaFieldKeys.length > 0 ? (
        <dl className="product-details-modal__meta-grid">
          {renderProductDetailsFieldRows(product, bottomMetaFieldKeys, fieldHandlers)}
        </dl>
      ) : null}
    </div>
  );

  if (!embedMediaGallery) {
    const splitRest = (
      <>
        {commerceFold}
        {detailsBelow}
      </>
    );
    const portaledRest =
      fullWidthCommerceFold && showSplitRest && splitRestHost
        ? createPortal(splitRest, splitRestHost)
        : null;
    const inlineRest = fullWidthCommerceFold
      ? null
      : splitRest;

    return (
      <>
        <div className="product-details-modal__spec">{priceBlock}</div>
        {portaledRest}
        {inlineRest}
        <ProductBadgeExplainSheet
          isOpen={badgeExplain != null}
          title={badgeExplain?.title ?? ""}
          badgeKey={badgeExplain?.badgeKey ?? null}
          fallbackKey={badgeExplain?.fallbackKey ?? "listing_origin_unspecified"}
          onClose={() => setBadgeExplain(null)}
        />
      </>
    );
  }

  return (
    <>
      <div className="product-details-modal__row-top">
        {mediaGallery}
        <div className="product-details-modal__spec">{priceBlock}</div>
      </div>
      {detailsBelow}
      <ProductBadgeExplainSheet
        isOpen={badgeExplain != null}
        title={badgeExplain?.title ?? ""}
        badgeKey={badgeExplain?.badgeKey ?? null}
        fallbackKey={badgeExplain?.fallbackKey ?? "listing_origin_unspecified"}
        onClose={() => setBadgeExplain(null)}
      />
    </>
  );
}
