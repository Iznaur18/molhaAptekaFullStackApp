import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import { ADMIN_ORDERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./OrderStatusSelect.css";

/**
 * @param {{
 *   value: import('../../../entities/order/model/constants.js').ORDER_STATUSES[number];
 *   onChange: (next: import('../../../entities/order/model/constants.js').ORDER_STATUSES[number]) => void;
 *   isPending: boolean;
 *   error?: string;
 * }} props
 */
export function OrderStatusSelect({ value, onChange, isPending, error }) {
  return (
    <div className="order-status-select">
      <label className="order-status-select__label">
        <span>{ADMIN_ORDERS_PAGE_UI.STATUS_CHANGE_LABEL}</span>
        <select
          className="order-status-select__control"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isPending}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABEL_RU[status]}
            </option>
          ))}
        </select>
      </label>
      {isPending ? (
        <span className="order-status-select__pending" role="status">
          {ADMIN_ORDERS_PAGE_UI.STATUS_CHANGE_PENDING}
        </span>
      ) : null}
      {error ? (
        <span className="order-status-select__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
