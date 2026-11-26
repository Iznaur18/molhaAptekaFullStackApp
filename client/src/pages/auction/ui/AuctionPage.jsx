import { useCallback, useEffect, useMemo, useState } from "react";

import { filterAuctionDashboard } from "../../../entities/product-price-offer/lib/filterAuctionDashboard.js";
import { AUCTION_VIEW_FILTER_BUYER } from "../../../entities/product-price-offer/model/auctionViewFilters.js";
import { useIncomingPriceOffersQuery } from "../../../entities/product-price-offer/model/useIncomingPriceOffersQuery.js";
import { useMyPriceOfferBidsQuery } from "../../../entities/product-price-offer/model/useMyPriceOfferBidsQuery.js";
import { AuctionBuyerBidRow } from "../../../entities/product-price-offer/ui/AuctionBuyerBidRow.jsx";
import { AuctionSellerOfferRow } from "../../../entities/product-price-offer/ui/AuctionSellerOfferRow.jsx";
import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { AuctionPageToolbar } from "./AuctionPageToolbar.jsx";

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
  const [viewFilter, setViewFilter] = useState(AUCTION_VIEW_FILTER_BUYER);

  const bidsQuery = useMyPriceOfferBidsQuery({ enabled: isAuthorized });
  const offersQuery = useIncomingPriceOffersQuery({ enabled: isAuthorized });

  const allBuyerBids = isAuthorized ? (bidsQuery.data ?? []) : [];
  const allSellerOffers = isAuthorized ? (offersQuery.data ?? []) : [];

  const { buyerBids, sellerOffers } = useMemo(
    () =>
      filterAuctionDashboard(allBuyerBids, allSellerOffers, {
        viewFilter,
      }),
    [allBuyerBids, allSellerOffers, viewFilter],
  );

  const isBuyerTab = viewFilter === AUCTION_VIEW_FILTER_BUYER;
  const visibleItems = isBuyerTab ? buyerBids : sellerOffers;

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

  const toolbar = (
    <AuctionPageToolbar viewFilter={viewFilter} onViewFilterChange={setViewFilter} />
  );

  if (phase === "loading") {
    return (
      <div className="auction-page">
        {toolbar}
        <p className="auction-page__state">{AUCTION_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="auction-page">
        {toolbar}
        <p className="auction-page__state auction-page__state_error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const emptyMessage =
    visibleItems.length === 0
      ? isBuyerTab
        ? AUCTION_PAGE_UI.BUYER_EMPTY
        : AUCTION_PAGE_UI.SELLER_EMPTY
      : null;

  return (
    <div className="auction-page">
      {toolbar}

      {emptyMessage ? (
        <p className="auction-page__state">{emptyMessage}</p>
      ) : (
        <div className="auction-dashboard">
          {isBuyerTab ? (
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
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
