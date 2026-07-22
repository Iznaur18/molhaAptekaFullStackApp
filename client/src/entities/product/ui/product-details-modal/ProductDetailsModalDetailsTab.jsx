import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { ProductDetailsAboveNameChips } from "../ProductDetailsAboveNameChips.jsx";
import { ProductDetailsBadgeStack } from "../ProductDetailsBadgeStack.jsx";
import { ProductDetailsSellerPreview } from "../ProductDetailsSellerPreview.jsx";
import { ProductMediaGalleryReadonly } from "../ProductMediaGalleryReadonly.jsx";
import { ProductPriceDisplay } from "../ProductPriceDisplay.jsx";
import { ProductDetailsContentSwitcher } from "./ProductDetailsContentSwitcher.jsx";
import { ProductDetailsModalPurchaseActions } from "./ProductDetailsModalPurchaseActions.jsx";
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
 *   ctrl: ReturnType<import('./useProductDetailsModalController.js').useProductDetailsModalController>;
 * }} props
 */
export function ProductDetailsModalDetailsTab({
  product,
  isOpen,
  isAuthorized,
  isPremiumUser = false,
  onRequestLogin,
  onProductStatsUpdate,
  currentUserId = null,
  mobileReportOverlay = null,
  productTitleId,
  embedMediaGallery = true,
  ctrl,
}) {
  const {
    imageUrls,
    previewVideoUrl,
    auctionUi,
    installmentUi,
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
    isOwnProduct,
  } = ctrl;

  const priceBlock = showPriceBlock ? (
    <div className="product-details-modal__price-block product-details-modal__price-block--inline-actions">
      <ProductPriceDisplay
        product={product}
        showLabel={false}
        className="product-details-modal__price-display"
        showDiscountBadge
        showLoyaltyBadge
        isAuthorized={isAuthorized}
      />
      <ProductDetailsAboveNameChips product={product} />
      <h3 id={productTitleId} className="product-details-modal__product-name">
        {product.productName?.trim() || "Товар"}
      </h3>
      <ProductDetailsBadgeStack product={product} />
      <ProductDetailsModalPurchaseActions
        productId={String(product._id)}
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        purchaseLimit={purchaseLimit}
        canShowAddToCart={canShowAddToCart}
        auctionUi={auctionUi}
        installmentUi={installmentUi}
        onAuctionClick={handleAuctionShortcutClick}
        onInstallmentClick={handleInstallmentShortcutClick}
      />
    </div>
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
                productId={String(product._id)}
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
    <>
      {topStatFieldKeys.length > 0 ? (
        <dl className="product-details-modal__stats-grid product-details-modal__stats-grid--standalone">
          {renderProductDetailsFieldRows(product, topStatFieldKeys, fieldHandlers)}
        </dl>
      ) : null}

      <ProductDetailsSellerPreview
        seller={product.productSeller}
        onOpenProfile={handleOpenSellerProfile}
      />

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
          {bottomMetaFieldKeys.length > 0 ? (
            <dl className="product-details-modal__meta-grid">
              {renderProductDetailsFieldRows(product, bottomMetaFieldKeys, fieldHandlers)}
            </dl>
          ) : null}
        </section>
      ) : null}
    </>
  );

  if (!embedMediaGallery) {
    return (
      <>
        <div className="product-details-modal__spec">{priceBlock}</div>
        {detailsBelow}
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
    </>
  );
}
