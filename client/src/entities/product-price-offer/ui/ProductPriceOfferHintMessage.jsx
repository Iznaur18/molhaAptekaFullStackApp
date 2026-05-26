import "./ProductPriceOffer.css";

/**
 * @param {{ children: import('react').ReactNode; className?: string }} props
 */
export function ProductPriceOfferHintMessage({ children, className = "" }) {
  const classNames = [
    "product-price-offer__hint",
    "product-price-offer__hint--with-icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={classNames}>
      <span className="product-price-offer__hint-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <rect x="11" y="7" width="2" height="7" rx="1" fill="#fff" />
          <circle cx="12" cy="17" r="1.25" fill="#fff" />
        </svg>
      </span>
      <span>{children}</span>
    </p>
  );
}
