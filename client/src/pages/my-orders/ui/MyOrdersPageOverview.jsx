import { ChevronRight } from "lucide-react";

import { MY_ORDERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./MyOrdersPageOverview.css";

/**
 * @param {{
 *   inProgressCount: number;
 *   attentionCount: number;
 *   totalAmountRub: number;
 *   attentionOnly: boolean;
 *   inProgressActive?: boolean;
 *   onInProgressFilterClick: () => void;
 *   onAttentionFilterChange: (value: boolean) => void;
 * }} props
 */
export function MyOrdersPageOverview({
  inProgressCount,
  attentionCount,
  totalAmountRub,
  attentionOnly,
  inProgressActive = false,
  onInProgressFilterClick,
  onAttentionFilterChange,
}) {
  return (
    <div
      className="my-orders-overview"
      role="region"
      aria-label={MY_ORDERS_PAGE_UI.TITLE}
    >
      <button
        type="button"
        className={[
          "my-orders-overview__tile",
          inProgressActive ? "my-orders-overview__tile_active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={inProgressActive}
        onClick={onInProgressFilterClick}
      >
        <span className="my-orders-overview__label">
          {MY_ORDERS_PAGE_UI.OVERVIEW_IN_PROGRESS}
        </span>
        <span className="my-orders-overview__value-row">
          <strong className="my-orders-overview__value">{inProgressCount}</strong>
          <AppIcon
            icon={ChevronRight}
            size="sm"
            className="my-orders-overview__go"
            aria-hidden
          />
        </span>
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
        <span className="my-orders-overview__label">
          {MY_ORDERS_PAGE_UI.OVERVIEW_ATTENTION}
        </span>
        <span className="my-orders-overview__value-row">
          <strong className="my-orders-overview__value">{attentionCount}</strong>
          <AppIcon
            icon={ChevronRight}
            size="sm"
            className="my-orders-overview__go"
            aria-hidden
          />
        </span>
      </button>

      <div className="my-orders-overview__tile my-orders-overview__tile_static">
        <span className="my-orders-overview__label">
          {MY_ORDERS_PAGE_UI.OVERVIEW_TOTAL}
        </span>
        <strong className="my-orders-overview__value">
          {formatPriceRub(totalAmountRub)}
        </strong>
      </div>
    </div>
  );
}
