import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { buildProductDetailsBadgeItems } from "../lib/buildProductDetailsBadgeItems.js";

import "./product-details-modal/ProductDetailsModalPrice.css";
import "./product-card/ProductCardBadges.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductDetailsBadgeStack({ product }) {
  const items = buildProductDetailsBadgeItems({ product });

  return (
    <div className="product-details-modal__price-badge-row">
      {items.map((item) => {
        if (item.kind === "raffle") {
          return (
            <p key={item.key} className="product-card__raffle-badge" role="status">
              {item.label}
            </p>
          );
        }

        const ListingOriginIcon = item.Icon;
        return (
          <div
            key={item.key}
            className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--listing-origin"
            aria-label={PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_SLOT_ARIA}
          >
            <ListingOriginIcon
              className="product-details-modal__meta-info-chip-icon"
              size={14}
              aria-hidden
            />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
