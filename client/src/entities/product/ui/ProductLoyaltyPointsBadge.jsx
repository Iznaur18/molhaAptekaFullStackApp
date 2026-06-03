import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { resolveProductLoyaltyPointsPerUnit } from "../lib/resolveProductLoyaltyPointsPerUnit.js";
import { shouldShowProductLoyaltyPointsBadge } from "../lib/shouldShowProductLoyaltyPointsBadge.js";

import "./ProductLoyaltyPointsBadge.css";

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   isAuthorized?: boolean;
 *   isPremiumUser?: boolean;
 *   variant?: "inline" | "overlay";
 * }} props
 */
export function ProductLoyaltyPointsBadge({
  product,
  isAuthorized = false,
  isPremiumUser = false,
  variant = "inline",
}) {
  if (!shouldShowProductLoyaltyPointsBadge(product)) {
    return null;
  }

  const points = resolveProductLoyaltyPointsPerUnit(product);
  const label = (() => {
    if (!isAuthorized) {
      return PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(points);
    }
    if (isPremiumUser) {
      return PRODUCT_CARD_UI.LOYALTY_POINTS_PREMIUM(points);
    }
    return PRODUCT_CARD_UI.LOYALTY_POINTS_WITH_PREMIUM(points);
  })();

  const className = [
    "product-loyalty-points-badge",
    variant === "overlay" ? "product-loyalty-points-badge--overlay" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} title={PRODUCT_CARD_UI.LOYALTY_POINTS_TOOLTIP}>
      {label}
    </span>
  );
}
