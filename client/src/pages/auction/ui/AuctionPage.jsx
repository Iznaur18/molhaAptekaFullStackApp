import { useCallback, useEffect, useMemo, useState } from "react";

import { bidNeedsAttention, offerNeedsAttention } from "../../../entities/product-price-offer/lib/auctionDashboardAttention.js";
import { filterAuctionDashboard } from "../../../entities/product-price-offer/lib/filterAuctionDashboard.js";
import { summarizeAuctionDashboard } from "../../../entities/product-price-offer/lib/summarizeAuctionDashboard.js";
import {
  AUCTION_VIEW_FILTER_BUYER,
  AUCTION_VIEW_FILTER_SELLER,
} from "../../../entities/product-price-offer/model/auctionViewFilters.js";
import { useIncomingPriceOffersQuery } from "../../../entities/product-price-offer/model/useIncomingPriceOffersQuery.js";
import { useMyPriceOfferBidsQuery } from "../../../entities/product-price-offer/model/useMyPriceOfferBidsQuery.js";
import { AuctionBuyerBidRow } from "../../../entities/product-price-offer/ui/AuctionBuyerBidRow.jsx";
import { AuctionSellerOfferRow } from "../../../entities/product-price-offer/ui/AuctionSellerOfferRow.jsx";
import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { AuctionPageOverview } from "./AuctionPageOverview.jsx";
import { AuctionPageSection } from "./AuctionPageSection.jsx";
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
  const [viewFilter, setViewFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const bidsQuery = useMyPriceOfferBidsQuery({ enabled: isAuthorized });
  const offersQuery = useIncomingPriceOffersQuery({ enabled: isAuthorized });

  const allBuyerBids = isAuthorized ? (bidsQuery.data ?? []) : [];
  const allSellerOffers = isAuthorized ? (offersQuery.data ?? []) : [];

  const summary = useMemo(
    () => summarizeAuctionDashboard(allBuyerBids, allSellerOffers),
    [allBuyerBids, allSellerOffers],
  );

  const { buyerBids, sellerOffers } = useMemo(
    () =>
      filterAuctionDashboard(allBuyerBids, allSellerOffers, {
        viewFilter,
        attentionOnly,
      }),
    [allBuyerBids, allSellerOffers, viewFilter, attentionOnly],
  );

  const totalAll = allBuyerBids.length + allSellerOffers.length;
  const totalVisible = buyerBids.length + sellerOffers.length;
  const hasFilters = Boolean(viewFilter) || attentionOnly;
  const summaryCountLabel = hasFilters
    ? AUCTION_PAGE_UI.COUNT_FILTERED(totalVisible, totalAll)
    : AUCTION_PAGE_UI.COUNT_ITEMS(totalAll);

  const isLoading = isAuthorized && (bidsQuery.isPending || offersQuery.isPending);
  const queryError = bidsQuery.error ?? offersQuery.error;
  const error =
    queryError instanceof Error ? queryError.message : AUCTION_PAGE_UI.ERROR_GENERIC;
  const phase = isLoading ? "loading" : queryError ? "error" : "success";
  const isRefreshing = bidsQuery.isFetching || offersQuery.isFetching;

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

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      allBuyerBids.filter(bidNeedsAttention).forEach((bid) => next.add(`bid:${bid._id}`));
      allSellerOffers
        .filter(offerNeedsAttention)
        .forEach((offer) => next.add(`offer:${offer._id}`));
      return next;
    });
  }, [allBuyerBids, allSellerOffers]);

  const toggleExpanded = useCallback((rowId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(
      new Set([
        ...buyerBids.map((bid) => `bid:${bid._id}`),
        ...sellerOffers.map((offer) => `offer:${offer._id}`),
      ]),
    );
  }, [buyerBids, sellerOffers]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleBuyerFilterClick = useCallback(() => {
    setViewFilter(AUCTION_VIEW_FILTER_BUYER);
    setAttentionOnly(false);
  }, []);

  const handleSellerFilterClick = useCallback(() => {
    setViewFilter(AUCTION_VIEW_FILTER_SELLER);
    setAttentionOnly(false);
  }, []);

  if (!isAuthorized) {
    return null;
  }

  const overview = (
    <AuctionPageOverview
      buyerCount={summary.buyerCount}
      sellerCount={summary.sellerCount}
      attentionCount={summary.attentionCount}
      attentionOnly={attentionOnly}
      onBuyerFilterClick={handleBuyerFilterClick}
      onSellerFilterClick={handleSellerFilterClick}
      onAttentionFilterChange={setAttentionOnly}
    />
  );

  const listActions =
    totalVisible > 0 ? (
      <div className="auction-page__list-actions">
        <button type="button" className="auction-page__list-action" onClick={expandAll}>
          {AUCTION_PAGE_UI.EXPAND_ALL}
        </button>
        <button type="button" className="auction-page__list-action" onClick={collapseAll}>
          {AUCTION_PAGE_UI.COLLAPSE_ALL}
        </button>
        {attentionOnly ? (
          <p className="auction-page__filter-hint">{AUCTION_PAGE_UI.ATTENTION_FILTER_HINT}</p>
        ) : null}
      </div>
    ) : null;

  const toolbar = (
    <AuctionPageToolbar
      summaryCountLabel={summaryCountLabel}
      viewFilter={viewFilter}
      onViewFilterChange={(value) => {
        setViewFilter(value);
        if (value) {
          setAttentionOnly(false);
        }
      }}
      onRefresh={() => {
        void reload();
      }}
      isRefreshing={isRefreshing}
    />
  );

  if (phase === "loading") {
    return (
      <div className="auction-page">
        {toolbar}
        {overview}
        <p className="auction-page__state">{AUCTION_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="auction-page">
        {toolbar}
        {overview}
        <p className="auction-page__state auction-page__state_error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const emptyMessage =
    totalAll === 0
      ? AUCTION_PAGE_UI.BOTH_EMPTY
      : hasFilters
        ? AUCTION_PAGE_UI.EMPTY_BY_FILTER
        : AUCTION_PAGE_UI.BOTH_EMPTY;

  const showBuyerSection = buyerBids.length > 0;
  const showSellerSection = sellerOffers.length > 0;

  return (
    <div className="auction-page">
      {toolbar}
      {overview}
      {listActions}

      {!showBuyerSection && !showSellerSection ? (
        <p className="auction-page__state">{emptyMessage}</p>
      ) : (
        <div className="auction-dashboard">
          {showBuyerSection ? (
            <AuctionPageSection title={AUCTION_PAGE_UI.BUYER_SECTION_TITLE} count={buyerBids.length}>
              <ul className="auction-dashboard__list" role="list">
                {buyerBids.map((bid) => {
                  const rowId = `bid:${bid._id}`;
                  return (
                    <li key={bid._id} role="listitem">
                      <AuctionBuyerBidRow
                        bid={bid}
                        collapsible
                        expanded={expandedIds.has(rowId)}
                        onExpandedChange={() => toggleExpanded(rowId)}
                        isUserDataConfirmed={isUserDataConfirmed}
                        onProductClick={onProductClick}
                        onChanged={reload}
                      />
                    </li>
                  );
                })}
              </ul>
            </AuctionPageSection>
          ) : null}

          {showSellerSection ? (
            <AuctionPageSection
              title={AUCTION_PAGE_UI.SELLER_SECTION_TITLE}
              count={sellerOffers.length}
            >
              <ul className="auction-dashboard__list" role="list">
                {sellerOffers.map((offer) => {
                  const rowId = `offer:${offer._id}`;
                  return (
                    <li key={offer._id} role="listitem">
                      <AuctionSellerOfferRow
                        offer={offer}
                        collapsible
                        expanded={expandedIds.has(rowId)}
                        onExpandedChange={() => toggleExpanded(rowId)}
                        onProductClick={onProductClick}
                        onBuyerClick={onBuyerClick}
                        onChanged={reload}
                      />
                    </li>
                  );
                })}
              </ul>
            </AuctionPageSection>
          ) : null}
        </div>
      )}
    </div>
  );
}
