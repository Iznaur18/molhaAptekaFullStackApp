import { PRODUCT_PRICE_OFFER_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductPriceOfferBuyerBlock } from "../../../product-price-offer/ui/ProductPriceOfferBuyerBlock.jsx";
import { ProductPriceOfferSellerArchive } from "../../../product-price-offer/ui/ProductPriceOfferSellerArchive.jsx";
import { ProductPriceOfferSellerTab } from "../../../product-price-offer/ui/ProductPriceOfferSellerTab.jsx";

import "../../../product-price-offer/ui/ProductPriceOffer.css";

/**
 * @param {{
 *   productId: string;
 *   isSellerView: boolean;
 *   auctionUi: ReturnType<import('../../lib/resolveAuctionUiState.js').resolveAuctionUiState>;
 *   topOffers: import('../../../product-price-offer/model/types.js').PriceOfferFromApi[];
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   isOwnProduct: boolean;
 *   onOpenSellerProfile?: (userId: string) => void;
 *   onRequestLogin: () => void;
 *   onOffersChanged: () => void;
 *   onCloseModal?: () => void;
 *   showSellerArchive: boolean;
 *   isPurchaseBlocked?: boolean;
 *   blockedPurchaseLabel?: string;
 * }} props
 */
export function ProductDetailsModalAuctionTab({
  productId,
  isSellerView,
  auctionUi,
  topOffers,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
  onOpenSellerProfile,
  onRequestLogin,
  onOffersChanged,
  onCloseModal,
  showSellerArchive,
  isPurchaseBlocked = false,
  blockedPurchaseLabel = "",
}) {
  if (isSellerView) {
    return (
      <>
        <ProductPriceOfferSellerTab
          productId={productId}
          onOpenBuyer={onOpenSellerProfile}
          onChanged={onOffersChanged}
        />
        {showSellerArchive ? (
          <ProductPriceOfferSellerArchive
            productId={productId}
            onOpenBuyer={onOpenSellerProfile}
          />
        ) : null}
      </>
    );
  }

  return (
    <section
      id="product-details-auction"
      className="product-details-modal__auction-section"
      aria-label={PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}
    >
      {auctionUi.auctionActive ? (
        <ProductPriceOfferBuyerBlock
          productId={productId}
          isAuthorized={isAuthorized}
          isUserDataConfirmed={isUserDataConfirmed}
          isOwnProduct={isOwnProduct}
          top={topOffers}
          onOpenBuyer={onOpenSellerProfile}
          onRequestLogin={onRequestLogin}
          onOffersChanged={onOffersChanged}
          onCloseModal={onCloseModal}
          isPurchaseBlocked={isPurchaseBlocked}
          blockedPurchaseLabel={blockedPurchaseLabel}
        />
      ) : (
        <p className="product-price-offer__inactive-hint">
          {auctionUi.completedOnce
            ? PRODUCT_PRICE_OFFER_UI.AUCTION_ENDED
            : PRODUCT_PRICE_OFFER_UI.AUCTION_EMPTY}
        </p>
      )}
    </section>
  );
}
