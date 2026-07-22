import { CircleCheck, Tag } from "lucide-react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isProductOriginalBadgeVisible } from "../lib/productIsOriginal.js";
import { resolveProductPriceMarketStatusPresentation } from "../lib/productPriceMarketStatus.js";

import "./product-details-modal/ProductDetailsModalPrice.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductDetailsAboveNameChips({ product }) {
  const showOriginal = isProductOriginalBadgeVisible(product.productIsOriginal);
  const priceMarket = resolveProductPriceMarketStatusPresentation(
    product.productPriceMarketStatus,
  );

  return (
    <div className="product-details-modal__above-name-chip-row">
      {showOriginal ? (
        <div
          className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--original"
          aria-label={PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA}
        >
          <CircleCheck
            className="product-details-modal__meta-info-chip-icon"
            size={14}
            aria-hidden
          />
          {PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE}
        </div>
      ) : null}
      <div
        className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--price-status"
        aria-label={PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA}
        style={{
          backgroundColor: priceMarket.backgroundColor,
          color: priceMarket.color,
        }}
      >
        <Tag
          className="product-details-modal__meta-info-chip-icon"
          size={14}
          aria-hidden
        />
        <span>{priceMarket.label}</span>
      </div>
    </div>
  );
}
