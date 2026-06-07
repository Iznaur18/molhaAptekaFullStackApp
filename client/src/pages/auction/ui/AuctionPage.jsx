import { useCallback, useEffect } from "react";

import { useIncomingPriceOffersQuery } from "../../../entities/product-price-offer/model/useIncomingPriceOffersQuery.js";
import { useMyPriceOfferBidsQuery } from "../../../entities/product-price-offer/model/useMyPriceOfferBidsQuery.js";
import { AuctionBuyerBidRow } from "../../../entities/product-price-offer/ui/AuctionBuyerBidRow.jsx";
import { AuctionSellerOfferRow } from "../../../entities/product-price-offer/ui/AuctionSellerOfferRow.jsx";
import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import "./AuctionPage.css";

/**
 * @param {{
 *   isAuthorized?: boolean;
 *   isUserDataConfirmed?: boolean;
 *   onRequestLogin?: () => void;
 *   onProductClick?: (productId: string) => void;
 *   onBuyerClick?: (userId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function AuctionPage({
  isAuthorized = false,
  isUserDataConfirmed = false,
  onRequestLogin,
  onProductClick,
  onBuyerClick,
  onQueueChanged,
}) {
  const bidsQuery = useMyPriceOfferBidsQuery({ enabled: isAuthorized });
  const offersQuery = useIncomingPriceOffersQuery({ enabled: isAuthorized });

  const buyerBids = isAuthorized ? (bidsQuery.data ?? []) : [];
  const sellerOffers = isAuthorized ? (offersQuery.data ?? []) : [];
  const isLoading = isAuthorized && (bidsQuery.isPending || offersQuery.isPending);
  const queryError = bidsQuery.error ?? offersQuery.error;
  const error =
    queryError instanceof Error ? queryError.message : AUCTION_PAGE_UI.ERROR_GENERIC;
  const phase = isLoading ? "loading" : queryError ? "error" : "success";

  const reload = useCallback(async () => {
    if (!isAuthorized) {
      return;
    }
    await Promise.all([bidsQuery.refetch(), offersQuery.refetch()]);
    onQueueChanged?.();
  }, [bidsQuery, isAuthorized, offersQuery, onQueueChanged]);

  useRefetchOnVisible(reload, phase === "success" && isAuthorized);

  useEffect(() => {
    if (!isAuthorized) {
      onRequestLogin?.();
    }
  }, [isAuthorized, onRequestLogin]);

  if (!isAuthorized) {
    return null;
  }

  if (phase === "loading") {
    return <p className="auction-page__state">{AUCTION_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error") {
    return (
      <p className="auction-page__state auction-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  const showBuyerSection = buyerBids.length > 0;
  const showSellerSection = sellerOffers.length > 0;

  if (!showBuyerSection && !showSellerSection) {
    return <p className="auction-page__state">{AUCTION_PAGE_UI.BOTH_EMPTY}</p>;
  }

  return (
    <div className="auction-dashboard">
      {showBuyerSection ? (
        <section className="auction-dashboard__section">
          <h3 className="auction-dashboard__section-title">
            {AUCTION_PAGE_UI.BUYER_SECTION_TITLE}
          </h3>
          <ul className="auction-dashboard__list" role="list">
            {buyerBids.map((bid) => (
              <li key={bid._id} role="listitem">
                <AuctionBuyerBidRow
                  bid={bid}
                  isUserDataConfirmed={isUserDataConfirmed}
                  onProductClick={onProductClick}
                  onChanged={reload}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showSellerSection ? (
        <section className="auction-dashboard__section">
          <h3 className="auction-dashboard__section-title">
            {AUCTION_PAGE_UI.SELLER_SECTION_TITLE}
          </h3>
          <ul className="auction-dashboard__list" role="list">
            {sellerOffers.map((offer) => (
              <li key={offer._id} role="listitem">
                <AuctionSellerOfferRow
                  offer={offer}
                  onProductClick={onProductClick}
                  onBuyerClick={onBuyerClick}
                  onChanged={reload}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
