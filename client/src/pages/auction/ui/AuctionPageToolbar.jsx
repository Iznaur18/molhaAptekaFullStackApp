import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   buyerCount: number;
 *   sellerCount: number;
 * }} props
 */
export function AuctionPageToolbar({ buyerCount, sellerCount }) {
  return (
    <div className="auction-page__toolbar">
      <div className="auction-page__toolbar-head">
        <h3 className="auction-page__heading">{AUCTION_PAGE_UI.TITLE}</h3>
        <div className="auction-page__counts">
          <span className="auction-page__count">{AUCTION_PAGE_UI.COUNT_BIDS(buyerCount)}</span>
          <span className="auction-page__count">{AUCTION_PAGE_UI.COUNT_OFFERS(sellerCount)}</span>
        </div>
      </div>
    </div>
  );
}
