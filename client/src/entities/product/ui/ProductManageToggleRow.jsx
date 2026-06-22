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
 *   variant?: "default" | "auction" | "installment" | "danger";
 *   ariaLabel?: string;
 *   titleStatus?: string;
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
  titleStatus = "",
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

  const className = [
    "product-manage-toggle-row",
    `product-manage-toggle-row_${variant}`,
    checked && variant !== "danger" ? "product-manage-toggle-row_checked" : "",
    disabled ? "product-manage-toggle-row_disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const textBlock = (
    <span className="product-manage-toggle-row__text">
      <span className="product-manage-toggle-row__title">
        {title}
        {titleStatus ? (
          <span className="product-manage-toggle-row__title-status">{` ${titleStatus}`}</span>
        ) : null}
      </span>
      <span className="product-manage-toggle-row__description">{description}</span>
    </span>
  );

  const handleClick = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-label={ariaLabel ?? (titleStatus ? `${title} ${titleStatus}` : title)}
      role={onPress ? undefined : "switch"}
      aria-checked={onPress ? undefined : checked}
      onClick={handleClick}
    >
      {textBlock}
    </button>
  );
}
