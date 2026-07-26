import { useState } from "react";

import {
  offerNeedsAttention,
  resolveSellerOfferCollapsedPreview,
} from "../lib/auctionDashboardAttention.js";
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
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";

import { AuctionDashboardProductThumb } from "./AuctionDashboardProductThumb.jsx";
import { AuctionDashboardRowStatus } from "./AuctionDashboardRowStatus.jsx";
import { AuctionDashboardSellerActions } from "./AuctionDashboardSellerActions.jsx";

import "./AuctionDashboard.css";

/**
 * @param {{
 *   offer: import('../model/types.js').PriceOfferIncomingRow;
 *   onProductClick?: (productId: string) => void;
 *   onBuyerClick?: (userId: string) => void;
 *   onChanged?: () => void;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: (expanded: boolean) => void;
 * }} props
 */
export function AuctionSellerOfferRow({
  offer,
  onProductClick,
  onBuyerClick,
  onChanged,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}) {
  const { acceptMutation, rejectMutation } = usePriceOfferSellerMutations(
    String(offer.productId),
  );
  const [error, setError] = useState("");

  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  const productName = offer.product?.productName ?? "Товар";
  const buyer = offer.buyer;
  const buyerId = buyer?._id != null ? String(buyer._id) : null;
  const buyerName = buyer?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPending = offer.status === PRICE_OFFER_STATUS_PENDING;
  const isAccepted = offer.status === PRICE_OFFER_STATUS_ACCEPTED;
  const isExpanded = !collapsible || expanded;
  const needsAttention = offerNeedsAttention(offer);
  const collapsedPreview = !isExpanded ? resolveSellerOfferCollapsedPreview(offer) : null;

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

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
    <article
      className={[
        "auction-dashboard-row",
        needsAttention ? "auction-dashboard-row_attention" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="auction-dashboard-row__head">
        <AuctionDashboardProductThumb product={offer.product} />
        <div className="auction-dashboard-row__main">
          <div className="auction-dashboard-row__head-line">
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
            </>
          ) : null}
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

      {collapsedPreview ? (
        <p className="auction-dashboard-row__preview">{collapsedPreview}</p>
      ) : null}

      {isExpanded ? (
        <>
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
        </>
      ) : null}
    </article>
  );
}
