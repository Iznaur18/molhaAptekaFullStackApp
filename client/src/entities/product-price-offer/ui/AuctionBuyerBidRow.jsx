import { useEffect, useState } from "react";

import { addressValueFromUser } from "../../address/lib/addressValueFromUser.js";
import { useCreateOrderMutation } from "../../order/model/useCreateOrderMutation.js";
import { useAuthSession } from "../../user/model/useAuthSession.js";
import { CheckoutForm } from "../../../shared/ui/CheckoutForm/CheckoutForm.jsx";
import { usePriceOfferMutations } from "../model/usePriceOfferMutations.js";
import { getProductPriceRubMaxError } from "../../product/lib/productPriceRubValidation.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import {
  AUCTION_PAGE_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../model/constants.js";

import "./AuctionDashboard.css";

/**
 * @param {{
 *   bid: import('../model/types.js').PriceOfferBuyerBidRow;
 *   isUserDataConfirmed?: boolean;
 *   onProductClick?: (productId: string) => void;
 *   onChanged?: () => void;
 * }} props
 */
export function AuctionBuyerBidRow({
  bid,
  isUserDataConfirmed = false,
  onProductClick,
  onChanged,
}) {
  const [priceInput, setPriceInput] = useState(() =>
    formatIntegerGroupRu(bid.offerPrice ?? ""),
  );
  const [error, setError] = useState("");
  const { patchMutation, cancelMutation } = usePriceOfferMutations(bid.productId);
  const createOrderMutation = useCreateOrderMutation();
  const isBusy = patchMutation.isPending || cancelMutation.isPending;
  const isPaying = createOrderMutation.isPending;
  const [showPay, setShowPay] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");
  const [defaultAddress, setDefaultAddress] = useState({});

  const productName = bid.product?.productName ?? "Товар";
  const imageUrl = bid.product?.productImageUrl ?? null;
  const isPending = bid.status === PRICE_OFFER_STATUS_PENDING;
  const isAccepted = bid.status === PRICE_OFFER_STATUS_ACCEPTED;

  useEffect(() => {
    setPriceInput(formatIntegerGroupRu(bid.offerPrice ?? ""));
  }, [bid.offerPrice, bid._id]);

  const { user } = useAuthSession();

  useEffect(() => {
    if (!showPay || !user) {
      return undefined;
    }
    setDefaultAddress(addressValueFromUser(user));
    return undefined;
  }, [showPay, user]);

  const handleUpdate = async () => {
    const price = parseRubPriceInput(priceInput);
    if (price == null || price < 1) {
      setError("Укажите целую цену больше 0");
      return;
    }
    const priceMaxError = getProductPriceRubMaxError(price);
    if (priceMaxError) {
      setError(PRODUCT_PRICE_OFFER_UI.ERROR_PRICE_MAX);
      return;
    }

    setError("");
    try {
      await patchMutation.mutateAsync(price);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const handleCancel = async () => {
    setError("");
    try {
      await cancelMutation.mutateAsync();
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const handlePay = async (payload) => {
    setPayError("");
    setPaySuccess("");
    try {
      await createOrderMutation.mutateAsync({
        items: [{ productId: bid.productId, quantity: 1 }],
        priceOfferId: bid._id,
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      setPaySuccess(PRODUCT_PRICE_OFFER_UI.PAY_ORDER_PLACED);
      setShowPay(false);
      onChanged?.();
    } catch (e) {
      setPayError(e instanceof Error ? e.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  return (
    <article className="auction-dashboard-row">
      <div className="auction-dashboard-row__head">
        {imageUrl ? (
          <img
            className="auction-dashboard-row__thumb"
            src={imageUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <span className="auction-dashboard-row__thumb auction-dashboard-row__thumb_placeholder">
            —
          </span>
        )}
        <div className="auction-dashboard-row__main">
          {typeof onProductClick === "function" ? (
            <button
              type="button"
              className="auction-dashboard-row__title"
              onClick={() => onProductClick(bid.productId)}
            >
              {productName}
            </button>
          ) : (
            <p className="auction-dashboard-row__title_static">{productName}</p>
          )}
          <p className="auction-dashboard-row__meta">
            {formatIsoDateTime(bid.createdAt)}
          </p>
          <p
            className={[
              "auction-dashboard-row__status",
              isPending
                ? "auction-dashboard-row__status_pending"
                : isAccepted
                  ? "auction-dashboard-row__status_accepted"
                  : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isPending
              ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
              : isAccepted
                ? showPay
                  ? null
                  : PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
                : null}
          </p>
          {isAccepted && bid.paymentDeadlineAt ? (
            <p className="auction-dashboard-row__meta">
              {AUCTION_PAGE_UI.PAY_DEADLINE_LABEL}:{" "}
              {formatIsoDateTime(bid.paymentDeadlineAt)}
            </p>
          ) : null}
        </div>
        <span className="auction-dashboard-row__price">
          {formatPriceRub(bid.offerPrice)}
        </span>
      </div>

      {isPending && isUserDataConfirmed ? (
        <div className="auction-dashboard-row__actions">
          <label className="auction-dashboard-row__field">
            {AUCTION_PAGE_UI.EDIT_PRICE_LABEL}
            <input
              {...INTEGER_INPUT_FIELD_PROPS}
              className="auction-dashboard-row__input"
              value={priceInput}
              onChange={(e) => setPriceInput(formatRubPriceInput(e.target.value))}
              disabled={isBusy}
            />
          </label>
          <button
            type="button"
            className="auction-dashboard-row__btn auction-dashboard-row__btn_primary"
            disabled={isBusy}
            onClick={() => void handleUpdate()}
          >
            {isBusy
              ? PRODUCT_PRICE_OFFER_UI.ACTION_PENDING
              : PRODUCT_PRICE_OFFER_UI.UPDATE}
          </button>
          <button
            type="button"
            className="auction-dashboard-row__btn"
            disabled={isBusy}
            onClick={() => void handleCancel()}
          >
            {PRODUCT_PRICE_OFFER_UI.CANCEL}
          </button>
        </div>
      ) : null}

      {isAccepted && !showPay ? (
        <div className="auction-dashboard-row__actions">
          <button
            type="button"
            className="auction-dashboard-row__btn auction-dashboard-row__btn_primary"
            onClick={() => setShowPay(true)}
          >
            {PRODUCT_PRICE_OFFER_UI.PAY_BUTTON}
          </button>
        </div>
      ) : null}

      {isAccepted && showPay ? (
        <div className="auction-dashboard-row__checkout">
          <CheckoutForm
            defaultDeliveryAddress={defaultAddress}
            isSubmitting={isPaying}
            submitError={payError}
            submitSuccess={paySuccess}
            onSubmit={handlePay}
          />
        </div>
      ) : null}

      {error ? (
        <p className="auction-dashboard-row__error" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}
