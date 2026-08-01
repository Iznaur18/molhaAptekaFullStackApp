import { ChevronRight } from "lucide-react";

import { AppIcon } from "../../../../shared/ui/icon/index.js";

import "./ProductDetailsFeatureCard.css";

/**
 * @param {{
 *   icon: import("lucide-react").LucideIcon;
 *   title: string;
 *   subtitle: string;
 *   ariaLabel: string;
 *   onClick: () => void;
 *   disabled?: boolean;
 * }} props
 */
export function ProductDetailsFeatureCard({
  icon,
  title,
  subtitle,
  ariaLabel,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="product-details-feature-card"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="product-details-feature-card__icon" aria-hidden>
        <AppIcon icon={icon} size="lg" strokeWidth={2.25} />
      </span>
      <span className="product-details-feature-card__text">
        <span className="product-details-feature-card__title">{title}</span>
        <span className="product-details-feature-card__subtitle">{subtitle}</span>
      </span>
      <span className="product-details-feature-card__chevron" aria-hidden>
        <AppIcon icon={ChevronRight} size="md" strokeWidth={2.5} />
      </span>
    </button>
  );
}
