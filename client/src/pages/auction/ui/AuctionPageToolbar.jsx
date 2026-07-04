import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AUCTION_VIEW_FILTER_OPTIONS } from "../../../entities/product-price-offer/model/auctionViewFilters.js";

/**
 * @param {{
 *   summaryCountLabel: string;
 *   viewFilter: string;
 *   onViewFilterChange: (value: string) => void;
 *   onRefresh?: () => void;
 *   isRefreshing?: boolean;
 * }} props
 */
export function AuctionPageToolbar({
  summaryCountLabel,
  viewFilter,
  onViewFilterChange,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <div className="auction-page__toolbar">
      <div className="auction-page__toolbar-head">
        <h3 className="auction-page__heading">{AUCTION_PAGE_UI.TITLE}</h3>
        <div className="auction-page__toolbar-meta">
          <span className="auction-page__count">{summaryCountLabel}</span>
          {typeof onRefresh === "function" ? (
            <button
              type="button"
              className="auction-page__refresh"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
            >
              {AUCTION_PAGE_UI.REFRESH}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="auction-page__chips"
        role="group"
        aria-label={AUCTION_PAGE_UI.VIEW_FILTER_LABEL}
      >
        {AUCTION_VIEW_FILTER_OPTIONS.map((option) => {
          const isActive = viewFilter === option.value;

          return (
            <button
              key={option.value || "all"}
              type="button"
              className={[
                "auction-page__chip",
                isActive ? "auction-page__chip_active" : "",
                option.value ? `auction-page__chip_${option.value}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isActive}
              onClick={() => onViewFilterChange(option.value)}
            >
              {AUCTION_PAGE_UI[option.labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
