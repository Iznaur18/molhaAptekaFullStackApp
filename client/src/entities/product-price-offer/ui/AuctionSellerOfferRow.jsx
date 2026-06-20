import { useState } from "react";

import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { usePriceOfferSellerMutations } from "../model/usePriceOfferSellerMutations.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../model/constants.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  AUCTION_PAGE_UI,
  PRODUCT_PRICE_OFFER_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";

import { AuctionDashboardRowStatus } from "./AuctionDashboardRowStatus.jsx";
import { AuctionDashboardSellerActions } from "./AuctionDashboardSellerActions.jsx";

import "./AuctionDashboard.css";

/**
 * @param {{
 *   offer: import('../model/types.js').PriceOfferIncomingRow;
 *   onProductClick?: (productId: string) => void;
 *   onBuyerClick?: (userId: string) => void;
 *   onChanged?: () => void;
 * }} props
 */
export function AuctionSellerOfferRow({
  offer,
  onProductClick,
  onBuyerClick,
  onChanged,
}) {
  const { acceptMutation, rejectMutation } = usePriceOfferSellerMutations(
    String(offer.productId),
  );
  const [error, setError] = useState("");

  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  const productName = offer.product?.productName ?? "Товар";
  const imageUrl = offer.product?.productImageUrl ?? null;
  const buyer = offer.buyer;
  const buyerId = buyer?._id != null ? String(buyer._id) : null;
  const buyerName = buyer?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPending = offer.status === PRICE_OFFER_STATUS_PENDING;
  const isAccepted = offer.status === PRICE_OFFER_STATUS_ACCEPTED;

  const handleAccept = async () => {
    setError("");
    try {
      await acceptMutation.mutateAsync(offer._id);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const handleReject = async () => {
    setError("");
    try {
      await rejectMutation.mutateAsync(offer._id);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : AUCTION_PAGE_UI.ERROR_GENERIC);
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
              onClick={() => onProductClick(offer.productId)}
            >
              {productName}
            </button>
          ) : (
            <p className="auction-dashboard-row__title_static">{productName}</p>
          )}
          <p className="auction-dashboard-row__meta">
            {buyerId && typeof onBuyerClick === "function" ? (
              <button
                type="button"
                className="auction-dashboard-row__buyer-link"
                onClick={() => onBuyerClick(buyerId)}
              >
                <UserPremiumDisplayName
                  name={buyerName}
                  isPremium={buyer?.isPremiumUser === true}
                  isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
                />
              </button>
            ) : (
              <UserPremiumDisplayName
                name={buyerName}
                isPremium={buyer?.isPremiumUser === true}
                isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
              />
            )}
            {" · "}
            {formatIsoDateTime(offer.createdAt)}
          </p>
          <AuctionDashboardRowStatus isPending={isPending} isAccepted={isAccepted}>
            {isPending
              ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
              : isAccepted
                ? PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE
                : null}
          </AuctionDashboardRowStatus>
        </div>
      </div>

      <div className="auction-dashboard-row__price-strip">
        <span className="auction-dashboard-row__price-label">
          {AUCTION_PAGE_UI.BID_PRICE_LABEL}
        </span>
        <span className="auction-dashboard-row__price">
          {formatPriceRub(offer.offerPrice)}
        </span>
      </div>

      {isPending ? (
        <AuctionDashboardSellerActions
          onAccept={() => void handleAccept()}
          onReject={() => void handleReject()}
          disabled={isBusy}
          acceptLabel={PRODUCT_PRICE_OFFER_UI.ACTION_ACCEPT}
          rejectLabel={PRODUCT_PRICE_OFFER_UI.ACTION_REJECT}
          pendingLabel={PRODUCT_PRICE_OFFER_UI.ACTION_PENDING}
        />
      ) : null}

      {error ? (
        <p className="auction-dashboard-row__error" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}
