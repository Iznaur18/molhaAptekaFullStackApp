import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { resolveProductDiscountPercent } from "../../lib/computeProductDiscountPercent.js";
import { ProductCharacteristicsDetails } from "../ProductCharacteristicsDetails.jsx";
import { ProductDetailsSellerPreview } from "../ProductDetailsSellerPreview.jsx";
import { ProductMediaGalleryReadonly } from "../ProductMediaGalleryReadonly.jsx";
import { ProductCatalogStatusBadges } from "../ProductCatalogStatusBadges.jsx";
import {
  ProductDiscountBadge,
  ProductPriceDisplay,
} from "../ProductPriceDisplay.jsx";
import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
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
  ctrl,
}) {
  const {
    imageUrls,
    previewVideoUrl,
    setGalleryLightboxOpen,
    auctionUi,
    installmentUi,
    fieldHandlers,
    handleOpenSellerProfile,
    showPriceBlock,
    topStatFieldKeys,
    bottomBlockFieldKeys,
    bottomMetaFieldKeys,
    canShowAddToCart,
    purchaseLimit,
    handleAuctionShortcutClick,
    handleInstallmentShortcutClick,
    isOwnProduct,
  } = ctrl;

  return (
    <>
      <div className="product-details-modal__row-top">
        <ProductMediaGalleryReadonly
          imageUrls={imageUrls}
          previewVideoUrl={previewVideoUrl}
          isActive={isOpen}
          resetToken={product._id}
          onLightboxOpenChange={setGalleryLightboxOpen}
          onBack={fieldHandlers.onClose}
          heroOverlay={
            <>
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
              {mobileReportOverlay ? (
                <div className="product-media-gallery-readonly__report-slot">
                  {mobileReportOverlay}
                </div>
              ) : null}
            </>
          }
        />
        <div className="product-details-modal__spec">
          {showPriceBlock ? (
            <div className="product-details-modal__price-block product-details-modal__price-block--inline-actions">
              <h3 className="product-details-modal__product-name">
                {product.productName?.trim() || "Товар"}
              </h3>
              <ProductPriceDisplay
                product={product}
                showLabel={false}
                className="product-details-modal__price-display"
              />
              <div className="product-details-modal__price-badge-row">
                <ProductDiscountBadge
                  discountPercent={resolveProductDiscountPercent(product)}
                  className="product-details-modal__price-discount"
                />
                <ProductCatalogStatusBadges
                  product={product}
                  isAuthorized={isAuthorized}
                  isPremiumUser={isPremiumUser}
                />
              </div>
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
          ) : null}
          {topStatFieldKeys.length > 0 ? (
            <dl className="product-details-modal__stats-grid">
              {renderProductDetailsFieldRows(product, topStatFieldKeys, fieldHandlers)}
            </dl>
          ) : null}
        </div>
      </div>

      <ProductDetailsSellerPreview
        seller={product.productSeller}
        onOpenProfile={handleOpenSellerProfile}
      />

      {(bottomBlockFieldKeys.length > 0 ||
        bottomMetaFieldKeys.length > 0 ||
        (Array.isArray(product.productCharacteristics) &&
          product.productCharacteristics.length > 0)) && (
        <section
          className="product-details-modal__details"
          aria-label={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
        >
          {bottomBlockFieldKeys.length > 0 ? (
            <dl className="product-details-modal__blocks">
              {renderProductDetailsFieldRows(product, bottomBlockFieldKeys, fieldHandlers)}
            </dl>
          ) : null}
          <ProductCharacteristicsDetails items={product.productCharacteristics} />
          {bottomMetaFieldKeys.length > 0 ? (
            <dl className="product-details-modal__meta-grid">
              {renderProductDetailsFieldRows(product, bottomMetaFieldKeys, fieldHandlers)}
            </dl>
          ) : null}
        </section>
      )}
    </>
  );
}
