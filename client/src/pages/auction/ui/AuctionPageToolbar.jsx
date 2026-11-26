import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AUCTION_VIEW_FILTER_OPTIONS } from "../../../entities/product-price-offer/model/auctionViewFilters.js";

/**
 * @param {{
 *   viewFilter: string;
 *   onViewFilterChange: (value: string) => void;
 * }} props
 */
export function AuctionPageToolbar({ viewFilter, onViewFilterChange }) {
  return (
    <div
      className="auction-page__chips"
      role="tablist"
      aria-label={AUCTION_PAGE_UI.VIEW_FILTER_LABEL}
    >
      {AUCTION_VIEW_FILTER_OPTIONS.map((option) => {
        const isActive = viewFilter === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            className={[
              "auction-page__chip",
              isActive ? "auction-page__chip_active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-selected={isActive}
            onClick={() => onViewFilterChange(option.value)}
          >
            {AUCTION_PAGE_UI[option.labelKey]}
          </button>
        );
      })}
    </div>
  );
}
