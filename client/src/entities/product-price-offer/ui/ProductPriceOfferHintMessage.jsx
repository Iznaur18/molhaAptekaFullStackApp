import { AppIcon, CircleAlert } from "../../../shared/ui/icon/index.js";

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
        <AppIcon icon={CircleAlert} size="md" />
      </span>
      <span>{children}</span>
    </p>
  );
}
