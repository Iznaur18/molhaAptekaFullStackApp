import { useCallback, useEffect, useState } from "react";

import { fetchIncomingPriceOffers } from "../../../entities/product-price-offer/api/fetchIncomingPriceOffers.js";
import { fetchMyPriceOfferBids } from "../../../entities/product-price-offer/api/fetchMyPriceOfferBids.js";
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
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [buyerBids, setBuyerBids] = useState(
    /** @type {import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow[]} */ ([]),
  );
  const [sellerOffers, setSellerOffers] = useState(
    /** @type {import('../../../entities/product-price-offer/model/types.js').PriceOfferIncomingRow[]} */ ([]),
  );

  const reload = useCallback(async () => {
    if (!isAuthorized) {
      setBuyerBids([]);
      setSellerOffers([]);
      setPhase("success");
      return;
    }

    try {
      const [bids, offers] = await Promise.all([
        fetchMyPriceOfferBids(),
        fetchIncomingPriceOffers(),
      ]);
      setBuyerBids(bids);
      setSellerOffers(offers);
      setPhase("success");
      setError("");
      onQueueChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : AUCTION_PAGE_UI.ERROR_GENERIC);
      setPhase("error");
    }
  }, [isAuthorized, onQueueChanged]);

  useRefetchOnVisible(reload, phase === "success" && isAuthorized);

  useEffect(() => {
    if (!isAuthorized) {
      onRequestLogin?.();
      setPhase("success");
      setBuyerBids([]);
      setSellerOffers([]);
      return;
    }
    setPhase("loading");
    void reload();
  }, [isAuthorized, onRequestLogin, reload]);

  if (!isAuthorized) {
    return null;
  }

  if (phase === "loading") {
    return (
      <p className="auction-page__state">{AUCTION_PAGE_UI.LOADING}</p>
    );
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
    return (
      <p className="auction-page__state">{AUCTION_PAGE_UI.BOTH_EMPTY}</p>
    );
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
