import { resolveProductWholesaleOffer } from "@izibuy/shared-lib";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../cart/model/useCart.js";
import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { PRODUCT_WHOLESALE_UI } from "../../../../shared/config/appUiCopy.js";
import { HOME_MAIN_VIEW_PATH } from "../../../../shared/lib/homeMainViewPaths.js";
import { formatPriceRub } from "../../../../shared/lib/formatPriceRub.js";

import "./ProductDetailsTeaser.css";
import "./ProductDetailsWholesaleOffer.css";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   canShowAddToCart: boolean;
 * }} props
 */
export function ProductDetailsWholesaleOffer({
  product,
  isAuthorized,
  onRequestLogin,
  canShowAddToCart,
}) {
  const navigate = useNavigate();
  const { items, setItemQuantity } = useCart();
  const offer = resolveProductWholesaleOffer(product);
  if (offer == null) {
    return null;
  }

  const productId = String(product._id ?? "");
  const purchaseLimit = getProductPurchaseLimit(product);
  const goDisabled = !canShowAddToCart || purchaseLimit < offer.minQty || productId.length === 0;

  const wholesalePriceLabel = formatPriceRub(offer.wholesalePrice);
  const savingsLabel = formatPriceRub(offer.savingsPerUnit);
  const title = PRODUCT_WHOLESALE_UI.DETAILS_OFFER_KICKER;
  const subtitle = PRODUCT_WHOLESALE_UI.DETAILS_OFFER_SUBTITLE(
    offer.minQty,
    wholesalePriceLabel,
    offer.discountPercent,
  );
  const goLabel = PRODUCT_WHOLESALE_UI.DETAILS_OFFER_GO;
  const ariaLabel = [
    PRODUCT_WHOLESALE_UI.DETAILS_OFFER_ARIA,
    subtitle,
    goLabel,
    PRODUCT_WHOLESALE_UI.DETAILS_OFFER_SAVINGS(savingsLabel),
  ].join(". ");

  const handleGoClick = () => {
    if (goDisabled) {
      return;
    }
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    const current = items[productId] ?? 0;
    if (current >= offer.minQty) {
      navigate(HOME_MAIN_VIEW_PATH.cart);
      return;
    }
    const nextQty = Math.min(purchaseLimit, Math.max(current, offer.minQty));
    setItemQuantity(productId, nextQty);
  };

  return (
    <aside
      className="product-details-teaser product-details-wholesale-offer"
      role="status"
      aria-label={ariaLabel}
    >
      <span className="product-details-teaser__copy">
        <span className="product-details-teaser__title">{title}</span>
        <span className="product-details-teaser__subtitle">{subtitle}</span>
      </span>
      <button
        type="button"
        className="product-details-teaser__go product-details-wholesale-offer__go"
        disabled={goDisabled}
        aria-label={PRODUCT_WHOLESALE_UI.DETAILS_OFFER_GO_ARIA}
        onClick={handleGoClick}
      >
        {goLabel}
      </button>
    </aside>
  );
}
