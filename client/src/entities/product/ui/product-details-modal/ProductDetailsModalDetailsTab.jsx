import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  INSTALLMENT_UI,
  PRODUCT_DETAILS_MODAL_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "../../../../shared/config/appUiCopy.js";
import { ProductCharacteristicsDetails } from "../ProductCharacteristicsDetails.jsx";
import { ProductDetailsSellerPreview } from "../ProductDetailsSellerPreview.jsx";
import { ProductMediaGalleryReadonly } from "../ProductMediaGalleryReadonly.jsx";
import { ProductPriceDisplay } from "../ProductPriceDisplay.jsx";
import { renderProductDetailsFieldRows } from "./renderProductDetailsFieldRows.jsx";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   ctrl: ReturnType<import('./useProductDetailsModalController.js').useProductDetailsModalController>;
 * }} props
 */
export function ProductDetailsModalDetailsTab({
  product,
  isOpen,
  isAuthorized,
  onRequestLogin,
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
        />
        <div className="product-details-modal__spec">
          {showPriceBlock ? (
            <div className="product-details-modal__price-block">
              <ProductPriceDisplay
                product={product}
                className="product-details-modal__price-display"
              />
              <div
                className={
                  canShowAddToCart
                    ? "product-details-modal__price-actions"
                    : "product-details-modal__price-actions product-details-modal__price-actions--no-cart"
                }
              >
                {canShowAddToCart ? (
                  <div className="product-details-modal__price-actions-cart">
                    <AddToCartButton
                      productId={String(product._id)}
                      isAuthorized={isAuthorized}
                      onRequestLogin={onRequestLogin}
                      maxQuantity={purchaseLimit}
                    />
                  </div>
                ) : null}
                <button
                  type="button"
                  className={
                    auctionUi.auctionActive
                      ? "product-details-modal__auction-btn"
                      : "product-details-modal__auction-btn product-details-modal__auction-btn--inactive"
                  }
                  disabled={!auctionUi.auctionActive}
                  aria-disabled={!auctionUi.auctionActive}
                  onClick={handleAuctionShortcutClick}
                >
                  {PRODUCT_PRICE_OFFER_UI.AUCTION_SHORTCUT}
                </button>
                <button
                  type="button"
                  className={
                    installmentUi.installmentActive
                      ? "product-details-modal__auction-btn"
                      : "product-details-modal__auction-btn product-details-modal__auction-btn--inactive"
                  }
                  disabled={!installmentUi.installmentActive}
                  aria-disabled={!installmentUi.installmentActive}
                  onClick={handleInstallmentShortcutClick}
                >
                  {INSTALLMENT_UI.SHORTCUT}
                </button>
              </div>
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
