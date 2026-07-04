import { MY_SALES_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./MySalesPageOverview.css";

/**
 * @param {{
 *   inProgressCount: number;
 *   attentionCount: number;
 *   totalAmountRub: number;
 *   attentionOnly: boolean;
 *   onInProgressFilterClick: () => void;
 *   onAttentionFilterChange: (value: boolean) => void;
 * }} props
 */
export function MySalesPageOverview({
  inProgressCount,
  attentionCount,
  totalAmountRub,
  attentionOnly,
  onInProgressFilterClick,
  onAttentionFilterChange,
}) {
  return (
    <div className="my-sales-overview" role="region" aria-label={MY_SALES_PAGE_UI.TITLE}>
      <button
        type="button"
        className="my-sales-overview__tile"
        onClick={onInProgressFilterClick}
      >
        <span className="my-sales-overview__label">{MY_SALES_PAGE_UI.OVERVIEW_IN_PROGRESS}</span>
        <strong className="my-sales-overview__value">{inProgressCount}</strong>
      </button>

      <button
        type="button"
        className={[
          "my-sales-overview__tile",
          attentionOnly ? "my-sales-overview__tile_active" : "",
          attentionCount > 0 ? "my-sales-overview__tile_attention" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={attentionOnly}
        onClick={() => onAttentionFilterChange(!attentionOnly)}
      >
        <span className="my-sales-overview__label">{MY_SALES_PAGE_UI.OVERVIEW_ATTENTION}</span>
        <strong className="my-sales-overview__value">{attentionCount}</strong>
      </button>

      <div className="my-sales-overview__tile my-sales-overview__tile_static">
        <span className="my-sales-overview__label">{MY_SALES_PAGE_UI.OVERVIEW_TOTAL}</span>
        <strong className="my-sales-overview__value">{formatPriceRub(totalAmountRub)}</strong>
      </div>
    </div>
  );
}
