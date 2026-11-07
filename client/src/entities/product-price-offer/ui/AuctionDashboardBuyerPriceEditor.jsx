import { INTEGER_INPUT_FIELD_PROPS } from "../../../shared/lib/numericInput.js";

/**
 * Поле новой цены своей ставки. Открывается по «Изменить ставку».
 *
 * @param {{
 *   label: string;
 *   value: string;
 *   onChange: (value: string) => void;
 *   onSubmit: () => void;
 *   onClose: () => void;
 *   disabled?: boolean;
 *   submitLabel: string;
 *   closeLabel: string;
 *   pendingLabel: string;
 * }} props
 */
export function AuctionDashboardBuyerPriceEditor({
  label,
  value,
  onChange,
  onSubmit,
  onClose,
  disabled = false,
  submitLabel,
  closeLabel,
  pendingLabel,
}) {
  return (
    <form
      className="auction-dashboard-row__editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="auction-dashboard-row__composer">
        <span className="auction-dashboard-row__composer-prefix" aria-hidden="true">
          ₽
        </span>
        <input
          {...INTEGER_INPUT_FIELD_PROPS}
          className="auction-dashboard-row__composer-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label={label}
          autoFocus
        />
        <button
          type="submit"
          className="auction-dashboard-row__composer-submit"
          disabled={disabled}
        >
          {disabled ? pendingLabel : submitLabel}
        </button>
      </div>
      <button
        type="button"
        className="auction-dashboard-row__text-btn"
        disabled={disabled}
        onClick={onClose}
      >
        {closeLabel}
      </button>
    </form>
  );
}
