import { resolveProductManageTogglePalette, resolveUploadedImageUrlForBrowser } from "@izibuy/shared-lib";

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
  titleStatus = "",
  imageUrl = null,
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

  const palette = resolveProductManageTogglePalette(variant, checked);
  const resolvedImageUrl =
    imageUrl != null && String(imageUrl).trim()
      ? resolveUploadedImageUrlForBrowser(String(imageUrl).trim())
      : null;

  const className = [
    "product-manage-toggle-row",
    variant === "danger" ? "product-manage-toggle-row_danger" : "",
    disabled ? "product-manage-toggle-row_disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
      style={
        palette
          ? {
              backgroundColor: palette.background,
              color: palette.title,
            }
          : undefined
      }
      onClick={handleClick}
    >
      <span className="product-manage-toggle-row__content">
        <span className="product-manage-toggle-row__text">
          <span
            className="product-manage-toggle-row__title"
            style={palette ? { color: palette.title } : undefined}
          >
            {title}
            {titleStatus ? (
              <span className="product-manage-toggle-row__title-status">{` ${titleStatus}`}</span>
            ) : null}
          </span>
          <span
            className="product-manage-toggle-row__description"
            style={palette ? { color: palette.description } : undefined}
          >
            {description}
          </span>
        </span>
        {resolvedImageUrl ? (
          <span className="product-manage-toggle-row__artwork" aria-hidden="true">
            <img src={resolvedImageUrl} alt="" />
          </span>
        ) : null}
      </span>
    </button>
  );
}
