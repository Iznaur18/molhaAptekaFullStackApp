import {
  bidNeedsAttention,
  resolveBuyerBidCollapsedPreview,
} from "../lib/auctionDashboardAttention.js";

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

import { AuctionDashboardRowStatus } from "./AuctionDashboardRowStatus.jsx";
import { AuctionDashboardBuyerPriceEditor } from "./AuctionDashboardBuyerPriceEditor.jsx";

import "./AuctionDashboard.css";

/**
 * @param {{
 *   bid: import('../model/types.js').PriceOfferBuyerBidRow;
 *   isUserDataConfirmed?: boolean;
 *   onProductClick?: (productId: string) => void;
 *   onChanged?: () => void;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: (expanded: boolean) => void;
 * }} props
 */
export function AuctionBuyerBidRow({
  bid,
  isUserDataConfirmed = false,
  onProductClick,
  onChanged,
  collapsible = false,
  expanded = true,
  onExpandedChange,
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
  const isExpanded = !collapsible || expanded;
  const needsAttention = bidNeedsAttention(bid);
  const collapsedPreview = !isExpanded ? resolveBuyerBidCollapsedPreview(bid) : null;

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

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
    <article
      className={[
        "auction-dashboard-row",
        needsAttention ? "auction-dashboard-row_attention" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
          <div className="auction-dashboard-row__head-line">
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
            {collapsible ? (
              <button
                type="button"
                className="auction-dashboard-row__chevron-btn"
                aria-expanded={isExpanded}
                aria-label={AUCTION_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
                onClick={toggleExpanded}
              >
                <span
                  className={[
                    "auction-dashboard-row__chevron",
                    isExpanded ? "auction-dashboard-row__chevron_expanded" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                >
                  ▸
                </span>
              </button>
            ) : null}
          </div>
          {isExpanded ? (
            <>
              <p className="auction-dashboard-row__meta">
                {formatIsoDateTime(bid.createdAt)}
              </p>
              <AuctionDashboardRowStatus isPending={isPending} isAccepted={isAccepted}>
                {isPending
                  ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
                  : isAccepted && !showPay
                    ? PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
                    : null}
              </AuctionDashboardRowStatus>
              {isAccepted && bid.paymentDeadlineAt ? (
                <p className="auction-dashboard-row__meta">
                  {AUCTION_PAGE_UI.PAY_DEADLINE_LABEL}:{" "}
                  {formatIsoDateTime(bid.paymentDeadlineAt)}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="auction-dashboard-row__price-strip">
        <span className="auction-dashboard-row__price-label">
          {AUCTION_PAGE_UI.BID_PRICE_LABEL}
        </span>
        <span className="auction-dashboard-row__price">{formatPriceRub(bid.offerPrice)}</span>
      </div>

      {collapsedPreview ? (
        <p className="auction-dashboard-row__preview">{collapsedPreview}</p>
      ) : null}

      {isExpanded ? (
        <>
          {isPending && isUserDataConfirmed ? (
            <AuctionDashboardBuyerPriceEditor
              label={AUCTION_PAGE_UI.EDIT_PRICE_LABEL}
              value={priceInput}
              onChange={(next) => setPriceInput(formatRubPriceInput(next))}
              onSubmit={() => void handleUpdate()}
              onCancel={() => void handleCancel()}
              disabled={isBusy}
              submitLabel={PRODUCT_PRICE_OFFER_UI.UPDATE}
              cancelLabel={PRODUCT_PRICE_OFFER_UI.CANCEL}
              pendingLabel={PRODUCT_PRICE_OFFER_UI.ACTION_PENDING}
            />
          ) : null}

          {isAccepted && !showPay ? (
            <button
              type="button"
              className="auction-dashboard-row__cta"
              onClick={() => setShowPay(true)}
            >
              {PRODUCT_PRICE_OFFER_UI.PAY_BUTTON}
            </button>
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
        </>
      ) : null}
    </article>
  );
}
