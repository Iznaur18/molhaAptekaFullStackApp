import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   buyerCount: number;
 *   sellerCount: number;
 *   attentionCount: number;
 *   attentionOnly: boolean;
 *   onBuyerFilterClick: () => void;
 *   onSellerFilterClick: () => void;
 *   onAttentionFilterChange: (value: boolean) => void;
 * }} props
 */
export function AuctionPageOverview({
  buyerCount,
  sellerCount,
  attentionCount,
  attentionOnly,
  onBuyerFilterClick,
  onSellerFilterClick,
  onAttentionFilterChange,
}) {
  return (
    <div className="auction-page__overview" role="region" aria-label={AUCTION_PAGE_UI.TITLE}>
      <button type="button" className="auction-page__overview-tile" onClick={onBuyerFilterClick}>
        <span className="auction-page__overview-label">{AUCTION_PAGE_UI.OVERVIEW_BUYER_BIDS}</span>
        <strong className="auction-page__overview-value">{buyerCount}</strong>
      </button>

      <button type="button" className="auction-page__overview-tile" onClick={onSellerFilterClick}>
        <span className="auction-page__overview-label">{AUCTION_PAGE_UI.OVERVIEW_INCOMING}</span>
        <strong className="auction-page__overview-value">{sellerCount}</strong>
      </button>

      <button
        type="button"
        className={[
          "auction-page__overview-tile",
          attentionOnly ? "auction-page__overview-tile_active" : "",
          attentionCount > 0 ? "auction-page__overview-tile_attention" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={attentionOnly}
        onClick={() => onAttentionFilterChange(!attentionOnly)}
      >
        <span className="auction-page__overview-label">{AUCTION_PAGE_UI.OVERVIEW_ATTENTION}</span>
        <strong className="auction-page__overview-value">{attentionCount}</strong>
      </button>
    </div>
  );
}
