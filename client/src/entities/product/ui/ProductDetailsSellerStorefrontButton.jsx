import { ChevronRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PRODUCT_SELLER_PREVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./ProductDetailsSellerStorefrontButton.css";

/**
 * @param {{ sellerId: string; embedded?: boolean }} props
 */
export function ProductDetailsSellerStorefrontButton({ sellerId, embedded = false }) {
  const navigate = useNavigate();
  const id = String(sellerId ?? "").trim();

  if (!id) {
    return null;
  }

  const handleClick = (event) => {
    event.stopPropagation();
    navigate(buildSellerProductsPath(id));
  };

  return (
    <button
      type="button"
      className={`product-details-seller-storefront-btn${
        embedded ? " product-details-seller-storefront-btn--embedded" : ""
      }`}
      aria-label={PRODUCT_SELLER_PREVIEW_UI.SELLER_STOREFRONT_ARIA}
      onClick={handleClick}
    >
      <span className="product-details-seller-storefront-btn__icon-wrap" aria-hidden="true">
        <AppIcon icon={Store} size="sm" strokeWidth={2.1} />
      </span>
      <span className="product-details-seller-storefront-btn__copy">
        <span className="product-details-seller-storefront-btn__title">
          {PRODUCT_SELLER_PREVIEW_UI.SELLER_STOREFRONT_BUTTON}
        </span>
        <span className="product-details-seller-storefront-btn__hint">
          {PRODUCT_SELLER_PREVIEW_UI.SELLER_STOREFRONT_HINT}
        </span>
      </span>
      <ChevronRight
        className="product-details-seller-storefront-btn__chevron"
        size={18}
        strokeWidth={2.25}
        aria-hidden="true"
      />
    </button>
  );
}
