import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { PRODUCT_FIELD_LABEL_RU } from "../model/productConstants.js";
import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "../lib/computeProductDiscountPercent.js";

import "./ProductPriceDisplay.css";

/**
 * @param {{
 *   product: {
 *     productPrice?: number | null;
 *     productOldPrice?: number | null;
 *     discountPercent?: number | null;
 *   };
 *   showLabel?: boolean;
 *   className?: string;
 *   variant?: "card" | "inline";
 * }} props
 */
export function ProductPriceDisplay({
  product,
  showLabel = true,
  className = "",
  variant = "card",
}) {
  const discountPercent = resolveProductDiscountPercent(product);
  const hasDiscount = hasProductCatalogDiscount(product);
  const currentPriceText = formatPriceRub(
    Math.floor(Number(product.productPrice)),
  );
  const oldPriceText = formatPriceRub(
    Math.floor(Number(product.productOldPrice)),
  );

  const ariaLabel = hasDiscount
    ? `Цена ${currentPriceText}, было ${oldPriceText}, скидка ${discountPercent} процентов`
    : `Цена ${currentPriceText}`;

  const rootClassName = [
    "product-price-display",
    `product-price-display--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={rootClassName} aria-label={ariaLabel}>
      {showLabel ? (
        <span className="product-price-display__label">
          {PRODUCT_FIELD_LABEL_RU.productPrice}
        </span>
      ) : null}
      <span className="product-price-display__current">{currentPriceText}</span>
      {hasDiscount ? (
        <span className="product-price-display__old">{oldPriceText}</span>
      ) : null}
    </p>
  );
}

/**
 * @param {{ discountPercent: number | null | undefined; className?: string }} props
 */
export function ProductDiscountBadge({ discountPercent, className = "" }) {
  if (discountPercent == null || discountPercent < 1) {
    return null;
  }

  const badgeText = `−${Math.floor(discountPercent)}%`;

  return (
    <p
      className={["product-discount-badge", className].filter(Boolean).join(" ")}
      role="status"
      aria-label={`Скидка ${Math.floor(discountPercent)} процентов`}
    >
      {badgeText}
    </p>
  );
}
