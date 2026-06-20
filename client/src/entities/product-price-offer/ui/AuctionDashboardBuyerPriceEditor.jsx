import { INTEGER_INPUT_FIELD_PROPS } from "../../../shared/lib/numericInput.js";

/**
 * @param {{
 *   label: string;
 *   value: string;
 *   onChange: (value: string) => void;
 *   onSubmit: () => void;
 *   onCancel: () => void;
 *   disabled?: boolean;
 *   submitLabel: string;
 *   cancelLabel: string;
 *   pendingLabel: string;
 * }} props
 */
export function AuctionDashboardBuyerPriceEditor({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  submitLabel,
  cancelLabel,
  pendingLabel,
}) {
  return (
    <div className="auction-dashboard-row__editor">
      <span className="auction-dashboard-row__editor-label">{label}</span>
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
        />
        <button
          type="button"
          className="auction-dashboard-row__composer-submit"
          disabled={disabled}
          onClick={onSubmit}
        >
          {disabled ? pendingLabel : submitLabel}
        </button>
      </div>
      <button
        type="button"
        className="auction-dashboard-row__editor-cancel"
        disabled={disabled}
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
    </div>
  );
}
