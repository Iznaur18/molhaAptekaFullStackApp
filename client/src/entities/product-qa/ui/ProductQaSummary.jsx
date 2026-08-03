import { PRODUCT_QA_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Показывается продавцу: занятость слотов и очередь без ответа.
 *
 * @param {{
 *   summary: import("../model/types.js").ProductQuestionSummary;
 * }} props
 */
export function ProductQaSummary({ summary }) {
  return (
    <div className="product-qa-summary">
      <span className="product-qa-summary__slots">
        {PRODUCT_QA_UI.SLOTS_LEFT(summary.activeCount, summary.limit)}
      </span>
      {summary.pendingCount > 0 ? (
        <span className="product-qa-summary__pending">
          {PRODUCT_QA_UI.PENDING_BADGE}: {summary.pendingCount}
        </span>
      ) : null}
    </div>
  );
}
