import "./ProductDetailsTeaser.css";

/**
 * @param {{
 *   title: string;
 *   subtitle: string;
 *   goLabel: string;
 *   ariaLabel: string;
 *   onClick: () => void;
 * }} props
 */
export function ProductDetailsTeaser({ title, subtitle, goLabel, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      className="product-details-teaser"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="product-details-teaser__copy">
        <span className="product-details-teaser__title">{title}</span>
        <span className="product-details-teaser__subtitle">{subtitle}</span>
      </span>
      <span className="product-details-teaser__go">{goLabel}</span>
    </button>
  );
}
