import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePriceOfferMutations } from "../../../entities/product-price-offer/model/usePriceOfferMutations.js";
import { invalidatePriceOfferQueries } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { resolveProductImageUrl } from "../../../entities/product/lib/resolveProductImageUrl.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../../entities/product/model/productConstants.js";
import { CART_AUCTION_UI } from "../../../shared/config/appUiCopy.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Строка выигранного лота: оформление через общий checkout sheet.
 *
 * @param {{
 *   bid: import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow;
 *   onCheckout: (bid: import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow) => void;
 * }} props
 */
export function CartAuctionLine({ bid, onCheckout }) {
  const queryClient = useQueryClient();
  const { cancelMutation } = usePriceOfferMutations(bid.productId);
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedImage = resolveProductImageUrl(bid.product);
  const imageUrl =
    imageFailed || !resolvedImage
      ? PRODUCT_IMAGE_PLACEHOLDER_URL
      : resolvedImage;
  const productName = bid.product?.productName ?? "";

  const handleRemove = async () => {
    if (!window.confirm(CART_AUCTION_UI.REMOVE_CONFIRM)) {
      return;
    }
    try {
      await cancelMutation.mutateAsync();
      void invalidatePriceOfferQueries(queryClient);
    } catch (error) {
      // mutation.error показывается ниже
      void error;
    }
  };

  return (
    <article className="cart-auction-line">
      <div className="cart-auction-line__head">
        <img
          className="cart-auction-line__image"
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
        <div className="cart-auction-line__info">
          <span className="cart-auction-line__badge">{CART_AUCTION_UI.BADGE}</span>
          <h3 className="cart-auction-line__heading">{productName}</h3>
          <p className="cart-auction-line__price">
            <span className="cart-auction-line__price-label">
              {CART_AUCTION_UI.PRICE_LABEL}
            </span>
            <span className="cart-auction-line__price-value">
              {formatPriceRub(bid.offerPrice)}
            </span>
          </p>
          {bid.paymentDeadlineAt ? (
            <p className="cart-auction-line__deadline">
              {CART_AUCTION_UI.DEADLINE_LABEL}:{" "}
              {formatIsoDateTime(bid.paymentDeadlineAt)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="cart-auction-line__actions">
        <button
          type="button"
          className="cart-auction-line__checkout"
          onClick={() => onCheckout(bid)}
        >
          {CART_AUCTION_UI.CHECKOUT}
        </button>
        <button
          type="button"
          className="cart-auction-line__remove"
          onClick={() => void handleRemove()}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending
            ? CART_AUCTION_UI.REMOVE_PENDING
            : CART_AUCTION_UI.REMOVE}
        </button>
      </div>

      {cancelMutation.isError ? (
        <p className="cart-auction-line__error" role="alert">
          {cancelMutation.error instanceof Error
            ? cancelMutation.error.message
            : CART_AUCTION_UI.ERROR_GENERIC}
        </p>
      ) : null}
    </article>
  );
}
