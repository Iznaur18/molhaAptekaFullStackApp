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

  const className = [
    "product-manage-toggle-row",
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
      aria-label={ariaLabel ?? title}
      role={showSwitch ? "switch" : "button"}
      aria-checked={showSwitch ? checked : undefined}
      onClick={handleActivate}
    >
      <span className="product-manage-toggle-row__text">
        <span className="product-manage-toggle-row__title">{title}</span>
        <span className="product-manage-toggle-row__description">{description}</span>
      </span>

      {showSwitch ? (
        <span
          className="product-manage-toggle-row__switch"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            className="product-manage-toggle-row__switch-input"
            checked={checked}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleSwitchChange}
          />
          <span className="product-manage-toggle-row__switch-track" aria-hidden="true">
            <span className="product-manage-toggle-row__switch-thumb" />
          </span>
        </span>
      ) : null}

      {showChevron ? (
        <span className="product-manage-toggle-row__chevron" aria-hidden="true">
          ›
        </span>
      ) : null}
    </button>
  );
}
