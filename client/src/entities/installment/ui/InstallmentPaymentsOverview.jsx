import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS } from "../model/constants.js";

import "./InstallmentPaymentsOverview.css";

/**
 * @param {{
 *   activeCount: number;
 *   attentionCount: number;
 *   totalRemainingRub: number;
 *   attentionOnly: boolean;
 *   onAttentionFilterChange: (value: boolean) => void;
 *   onActiveFilterClick: () => void;
 *   remainingLabel?: string;
 *   regionAriaLabel?: string;
 * }} props
 */
export function InstallmentPaymentsOverview({
  activeCount,
  attentionCount,
  totalRemainingRub,
  attentionOnly,
  onAttentionFilterChange,
  onActiveFilterClick,
  remainingLabel = INSTALLMENT_UI.PAYMENTS_OVERVIEW_REMAINING,
  regionAriaLabel = INSTALLMENT_UI.PAYMENTS_PAGE_TITLE,
}) {
  return (
    <div className="installment-payments-overview" role="region" aria-label={regionAriaLabel}>
      <button
        type="button"
        className="installment-payments-overview__tile"
        onClick={onActiveFilterClick}
      >
        <span className="installment-payments-overview__label">
          {INSTALLMENT_UI.PAYMENTS_OVERVIEW_ACTIVE}
        </span>
        <strong className="installment-payments-overview__value">{activeCount}</strong>
      </button>

      <button
        type="button"
        className={[
          "installment-payments-overview__tile",
          attentionOnly ? "installment-payments-overview__tile_active" : "",
          attentionCount > 0 ? "installment-payments-overview__tile_attention" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={attentionOnly}
        onClick={() => onAttentionFilterChange(!attentionOnly)}
      >
        <span className="installment-payments-overview__label">
          {INSTALLMENT_UI.PAYMENTS_OVERVIEW_ATTENTION}
        </span>
        <strong className="installment-payments-overview__value">{attentionCount}</strong>
      </button>

      <div className="installment-payments-overview__tile installment-payments-overview__tile_static">
        <span className="installment-payments-overview__label">
          {remainingLabel}
        </span>
        <strong className="installment-payments-overview__value">
          {formatPriceRub(totalRemainingRub)}
        </strong>
      </div>
    </div>
  );
}
