import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { getProductFieldLabel } from "../lib/productFieldRegistry.js";
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
  const currentPriceText = formatPriceRub(Math.floor(Number(product.productPrice)));
  const oldPriceText = formatPriceRub(Math.floor(Number(product.productOldPrice)));

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
          {getProductFieldLabel("productPrice")}
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
 * @param {{
 *   discountPercent: number | null | undefined;
 *   className?: string;
 *   variant?: "inline" | "overlay";
 * }} props
 */
export function ProductDiscountBadge({
  discountPercent,
  className = "",
  variant = "inline",
}) {
  if (discountPercent == null || discountPercent < 1) {
    return null;
  }

  const percent = Math.floor(discountPercent);
  const badgeText = PRODUCT_CARD_UI.DISCOUNT_BADGE(percent);

  const rootClassName = [
    "product-discount-badge",
    variant === "overlay" ? "product-discount-badge--overlay" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClassName} role="status" aria-label={badgeText}>
      {badgeText}
    </span>
  );
}
