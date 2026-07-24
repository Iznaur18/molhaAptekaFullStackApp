import "./ProductManageToggleRow.css";

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   checked?: boolean;
 *   onCheckedChange?: (checked: boolean) => void;
 *   onPress?: () => void;
 *   disabled?: boolean;
 *   pending?: boolean;
 *   pendingLabel?: string;
 *   variant?: "default" | "auction" | "installment" | "raffle" | "danger";
 *   ariaLabel?: string;
 *   titleStatus?: string;
 *   imageUrl?: string | null;
 * }} props
 */
export function ProductManageToggleRow({
  title,
  description,
  checked = false,
  onCheckedChange,
  onPress,
  disabled = false,
  pending = false,
  pendingLabel = "",
  variant = "default",
  ariaLabel,
}) {
  if (pending) {
    return (
      <div
        className="product-manage-toggle-row product-manage-toggle-row_pending"
        aria-live="polite"
      >
        {pendingLabel}
      </div>
    );
  }

  const isDanger = variant === "danger";
  const showChevron = variant === "installment" && typeof onPress === "function";
  const showSwitch = !isDanger && !showChevron;
  const label = ariaLabel ?? title;

  const handleActivate = () => {
    if (disabled) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(!checked);
  };

  const handleSwitchChange = (event) => {
    if (disabled) {
      return;
    }
    const next = event.target.checked;
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(next);
  };

  if (showSwitch) {
    return (
      <div
        className={[
          "product-manage-toggle-row",
          disabled ? "product-manage-toggle-row_disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        aria-label={label}
      >
        <button
          type="button"
          className="product-manage-toggle-row__text-button"
          disabled={disabled}
          aria-label={label}
          onClick={handleActivate}
        >
          <span className="product-manage-toggle-row__title">{title}</span>
          <span className="product-manage-toggle-row__description">{description}</span>
        </button>
        <label className="product-manage-toggle-row__switch">
          <input
            type="checkbox"
            className="product-manage-toggle-row__switch-input"
            checked={checked}
            disabled={disabled}
            aria-label={label}
            onChange={handleSwitchChange}
          />
          <span className="product-manage-toggle-row__switch-track" aria-hidden="true">
            <span className="product-manage-toggle-row__switch-thumb" />
          </span>
        </label>
      </div>
    );
  }

  const className = [
    "product-manage-toggle-row",
    "product-manage-toggle-row_pressable",
    isDanger ? "product-manage-toggle-row_danger" : "",
    disabled ? "product-manage-toggle-row_disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-label={label}
      onClick={handleActivate}
    >
      <span className="product-manage-toggle-row__text">
        <span className="product-manage-toggle-row__title">{title}</span>
        <span className="product-manage-toggle-row__description">{description}</span>
      </span>
      {showChevron ? (
        <span className="product-manage-toggle-row__chevron" aria-hidden="true">
          ›
        </span>
      ) : null}
    </button>
  );
}
