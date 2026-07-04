import { MY_ORDERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./MyOrdersPageOverview.css";

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
export function MyOrdersPageOverview({
  inProgressCount,
  attentionCount,
  totalAmountRub,
  attentionOnly,
  onInProgressFilterClick,
  onAttentionFilterChange,
}) {
  return (
    <div className="my-orders-overview" role="region" aria-label={MY_ORDERS_PAGE_UI.TITLE}>
      <button
        type="button"
        className="my-orders-overview__tile"
        onClick={onInProgressFilterClick}
      >
        <span className="my-orders-overview__label">{MY_ORDERS_PAGE_UI.OVERVIEW_IN_PROGRESS}</span>
        <strong className="my-orders-overview__value">{inProgressCount}</strong>
      </button>

      <button
        type="button"
        className={[
          "my-orders-overview__tile",
          attentionOnly ? "my-orders-overview__tile_active" : "",
          attentionCount > 0 ? "my-orders-overview__tile_attention" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={attentionOnly}
        onClick={() => onAttentionFilterChange(!attentionOnly)}
      >
        <span className="my-orders-overview__label">{MY_ORDERS_PAGE_UI.OVERVIEW_ATTENTION}</span>
        <strong className="my-orders-overview__value">{attentionCount}</strong>
      </button>

      <div className="my-orders-overview__tile my-orders-overview__tile_static">
        <span className="my-orders-overview__label">{MY_ORDERS_PAGE_UI.OVERVIEW_TOTAL}</span>
        <strong className="my-orders-overview__value">{formatPriceRub(totalAmountRub)}</strong>
      </div>
    </div>
  );
}
