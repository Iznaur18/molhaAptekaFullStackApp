import { ADD_TO_CART_UI } from "../config/appUiCopy.js";

import "./BlockedPurchaseButton.css";

/**
 * @param {{
 *   label?: string;
 *   className?: string;
 *   variant?: "cart" | "teaser" | "installment" | "offer";
 * }} props
 */
export function BlockedPurchaseButton({
  label = ADD_TO_CART_UI.BLOCKED,
  className = "",
  variant = "cart",
}) {
  const rootClassName = [
    variant === "cart" ? "add-to-cart add-to-cart--blocked" : "",
    variant === "teaser" ? "product-details-teaser__go product-details-teaser__go--blocked" : "",
    variant === "installment" ? "installment-buyer-block__submit installment-buyer-block__submit--blocked" : "",
    variant === "offer" ? "app-btn app-btn--contrast product-price-offer__btn product-price-offer__btn--blocked" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={rootClassName} disabled aria-disabled="true">
      {label}
    </button>
  );
}
