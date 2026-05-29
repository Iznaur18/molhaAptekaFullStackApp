import { AppIcon } from "../icon/index.js";

import "./HeaderCircleIconButton.css";

/**
 * @param {{
 *   onClick: () => void;
 *   isActive?: boolean;
 *   ariaLabel: string;
 *   icon: import("lucide-react").LucideIcon;
 *   badgeContent?: import("react").ReactNode;
 *   badgeAriaLabel?: string;
 *   badgeVariant?: "count" | "alert";
 *   className?: string;
 *   ariaExpanded?: boolean;
 *   ariaControls?: string;
 * }} props
 */
export function HeaderCircleIconButton({
  onClick,
  isActive = false,
  ariaLabel,
  icon,
  badgeContent = null,
  badgeAriaLabel,
  badgeVariant = "count",
  className,
  ariaExpanded,
  ariaControls,
}) {
  const buttonClassName = [
    "header-circle-button",
    isActive && "header-circle-button--active",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const badgeClassName = [
    "header-circle-button__badge",
    badgeVariant === "alert"
      ? "header-circle-button__badge_alert"
      : "header-circle-button__badge_count",
  ].join(" ");

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      <AppIcon icon={icon} size="lg" className="header-circle-button__icon" />
      {badgeContent != null ? (
        <span className={badgeClassName} aria-label={badgeAriaLabel}>
          {badgeContent}
        </span>
      ) : null}
    </button>
  );
}
