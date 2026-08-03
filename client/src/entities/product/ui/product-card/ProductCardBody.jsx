import { AddToCartButton } from "../../../../features/cart-add/ui/AddToCartButton.jsx";
import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductCardBannerContent } from "./ProductCardBannerContent.jsx";
import { ProductCardFooter } from "./ProductCardFooter.jsx";
import { ProductCardMedia } from "./ProductCardMedia.jsx";
import { ProductCardSellerToolbar } from "./ProductCardSellerToolbar.jsx";
import { ProductCardStandardContent } from "./ProductCardStandardContent.jsx";
import { ProductCardStatusSlot } from "./ProductCardStatusSlot.jsx";
import { renderProductCardSellerValue } from "./renderProductCardSellerValue.jsx";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 *   detailsSurface: ReturnType<import('./useProductCardDetailsSurface.js').useProductCardDetailsSurface>;
 * }} props
 */
export function ProductCardBody({ vm, detailsSurface }) {
  const sellerToolbar = <ProductCardSellerToolbar vm={vm} />;

  const renderSellerValue = (raw, display) =>
    renderProductCardSellerValue({
      raw,
      display,
      onSellerNameClick: vm.onSellerNameClick,
    });

  const detailsSurfaceProps = vm.isDetailsSurfaceInteractive
    ? {
        role: "button",
        tabIndex: 0,
        "aria-label": detailsSurface.detailsSurfaceLabel,
        onClick: detailsSurface.handleOpenDetails,
        onKeyDown: detailsSurface.handleDetailsSurfaceKeyDown,
      }
    : {};

  return (
    <article className={vm.cardClassName} aria-labelledby={vm.headingId}>
      <div className={vm.bodyClassName} {...detailsSurfaceProps}>
        <ProductCardMedia vm={vm} />
        {vm.showBannerLayout ? (
          <div className="product-card__banner-content">
            <ProductCardBannerContent
              vm={vm}
              renderSellerValue={renderSellerValue}
              statusSlot={<ProductCardStatusSlot vm={vm} />}
            />
            {vm.showBannerActions ? (
              <div
                className="product-card__banner-actions"
                aria-label={PRODUCT_CARD_UI.FOOTER_ACTIONS_ARIA}
                onClick={detailsSurface.stopCardDetailsActivation}
                onKeyDown={detailsSurface.stopCardDetailsActivation}
              >
                {vm.showAddToCartButton ? (
                  <AddToCartButton
                    productId={String(vm.product._id)}
                    isAuthorized={vm.isAuthorized}
                    onRequestLogin={vm.onRequestLoginAddToCart}
                    maxQuantity={vm.purchaseLimit}
                  />
                ) : null}
                {sellerToolbar}
              </div>
            ) : null}
          </div>
        ) : vm.isModerationQueue ? (
          <div className="product-card__list-content">
            <ProductCardStandardContent vm={vm} />
          </div>
        ) : (
          <ProductCardStandardContent vm={vm} />
        )}
      </div>
      {!vm.showBannerLayout ? (
        <ProductCardFooter
          vm={vm}
          sellerToolbar={sellerToolbar}
          stopCardDetailsActivation={detailsSurface.stopCardDetailsActivation}
        />
      ) : null}
    </article>
  );
}
