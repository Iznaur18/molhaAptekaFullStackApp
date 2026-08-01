import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { useAuthSession } from "../../user/model/useAuthSession.js";
import { resolveProductLoyaltyPointsPerUnit } from "../lib/resolveProductLoyaltyPointsPerUnit.js";
import { shouldShowProductLoyaltyPointsBadge } from "../lib/shouldShowProductLoyaltyPointsBadge.js";

import "./ProductLoyaltyPointsBadge.css";

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   isAuthorized?: boolean;
 *   variant?: "inline" | "overlay" | "detail";
 *   className?: string;
 *   onPress?: (payload: { kind: "loyalty"; label: string }) => void;
 * }} props
 */
export function ProductLoyaltyPointsBadge({
  product,
  isAuthorized = false,
  variant = "inline",
  className: classNameProp = "",
  onPress,
}) {
  const { user } = useAuthSession();
  const isUserDataConfirmed = isAuthorized && user?.isUserDataConfirmed === true;

  if (!shouldShowProductLoyaltyPointsBadge(product)) {
    return null;
  }

  const points = resolveProductLoyaltyPointsPerUnit(product);
  const label =
    variant === "detail"
      ? PRODUCT_CARD_UI.LOYALTY_POINTS_DETAIL(points)
      : (() => {
          if (!isAuthorized) {
            return PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(points);
          }
          if (isUserDataConfirmed) {
            return PRODUCT_CARD_UI.LOYALTY_POINTS_CONFIRMED(points);
          }
          return PRODUCT_CARD_UI.LOYALTY_POINTS_UNCONFIRMED(points);
        })();

  const className = [
    "product-loyalty-points-badge",
    variant === "overlay" ? "product-loyalty-points-badge--overlay" : "",
    variant === "detail" ? "product-loyalty-points-badge--detail" : "",
    typeof onPress === "function" ? "product-loyalty-points-badge--pressable" : "",
    classNameProp,
  ]
    .filter(Boolean)
    .join(" ");

  if (typeof onPress === "function") {
    return (
      <button
        type="button"
        className={className}
        aria-label={label}
        onClick={() => onPress({ kind: "loyalty", label })}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={className} title={PRODUCT_CARD_UI.LOYALTY_POINTS_TOOLTIP}>
      {label}
    </span>
  );
}
