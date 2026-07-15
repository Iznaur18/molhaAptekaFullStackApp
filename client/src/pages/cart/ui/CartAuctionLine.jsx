import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { invalidatePriceOfferQueries } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { usePriceOfferMutations } from "../../../entities/product-price-offer/model/usePriceOfferMutations.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../../entities/product/model/productConstants.js";
import { CART_AUCTION_UI } from "../../../shared/config/appUiCopy.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { CheckoutForm } from "../../../shared/ui/CheckoutForm/CheckoutForm.jsx";

/**
 * Строка выигранного лота: оформляется отдельным заказом по цене принятой ставки.
 *
 * @param {{
 *   bid: import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow;
 *   defaultDeliveryAddress: Record<string, unknown>;
 *   onCheckoutSuccess: () => void;
 * }} props
 */
export function CartAuctionLine({ bid, defaultDeliveryAddress, onCheckoutSuccess }) {
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const { cancelMutation } = usePriceOfferMutations(bid.productId);

  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const imageUrl = bid.product?.productImageUrl ?? PRODUCT_IMAGE_PLACEHOLDER_URL;
  const productName = bid.product?.productName ?? "";

  const handleCheckoutSubmit = async ({
    deliveryAddress,
    deliveryAddressFlat,
    paymentMethod,
  }) => {
    setError("");
    setSuccess("");
    try {
      await createOrderMutation.mutateAsync({
        items: [{ productId: bid.productId, quantity: 1 }],
        priceOfferId: bid._id,
        deliveryAddress,
        deliveryAddressFlat,
        paymentMethod,
      });
      setSuccess(CART_AUCTION_UI.ORDER_PLACED);
      setShowCheckout(false);
      void invalidatePriceOfferQueries(queryClient);
      onCheckoutSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : CART_AUCTION_UI.ERROR_GENERIC);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(CART_AUCTION_UI.REMOVE_CONFIRM)) {
      return;
    }
    setError("");
    try {
      await cancelMutation.mutateAsync();
      void invalidatePriceOfferQueries(queryClient);
    } catch (e) {
      setError(e instanceof Error ? e.message : CART_AUCTION_UI.ERROR_GENERIC);
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
              {CART_AUCTION_UI.DEADLINE_LABEL}: {formatIsoDateTime(bid.paymentDeadlineAt)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="cart-auction-line__actions">
        <button
          type="button"
          className="cart-auction-line__checkout"
          onClick={() => setShowCheckout((prev) => !prev)}
        >
          {showCheckout ? CART_AUCTION_UI.CHECKOUT_CANCEL : CART_AUCTION_UI.CHECKOUT}
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

      {showCheckout ? (
        <div className="cart-auction-line__checkout-zone">
          <CheckoutForm
            defaultDeliveryAddress={defaultDeliveryAddress}
            isSubmitting={createOrderMutation.isPending}
            submitError={error}
            submitSuccess={success}
            onSubmit={handleCheckoutSubmit}
          />
        </div>
      ) : null}

      {!showCheckout && error ? (
        <p className="cart-auction-line__error" role="alert">
          {error}
        </p>
      ) : null}
      {!showCheckout && success ? (
        <p className="cart-auction-line__success">{success}</p>
      ) : null}
    </article>
  );
}
