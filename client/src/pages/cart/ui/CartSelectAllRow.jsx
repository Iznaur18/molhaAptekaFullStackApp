import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./CartSelectAllRow.css";

/**
 * @param {{
 *   selectedCount: number;
 *   totalCount: number;
 *   areAllSelected: boolean;
 *   onToggleAll: () => void;
 * }} props
 */
export function CartSelectAllRow({
  selectedCount,
  totalCount,
  areAllSelected,
  onToggleAll,
}) {
  const isIndeterminate = !areAllSelected && selectedCount > 0;

  return (
    <div className="cart-select-all">
      <p className="cart-select-all__count">
        {CART_PAGE_UI.SELECTED_COUNT(selectedCount, totalCount)}
      </p>
      <button
        type="button"
        className="cart-select-all__toggle"
        onClick={onToggleAll}
        role="checkbox"
        aria-checked={isIndeterminate ? "mixed" : areAllSelected}
        aria-label={CART_PAGE_UI.SELECT_ALL}
      >
        <span className="cart-select-all__toggle-label">
          {CART_PAGE_UI.SELECT_ALL}
        </span>
        <span
          className={[
            "cart-select-all__box",
            areAllSelected && "cart-select-all__box_checked",
            isIndeterminate && "cart-select-all__box_indeterminate",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
