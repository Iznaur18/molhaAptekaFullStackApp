import { CircleCheck, Tag } from "lucide-react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_DETAILS_BADGE_SOFT_COLORS } from "../lib/productDetailsBadgeSoftPalette.js";
import { buildProductDetailsBadgeItems } from "../lib/buildProductDetailsBadgeItems.js";

import "./product-details-modal/ProductDetailsModalPrice.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductDetailsBadgeStack({ product }) {
  const items = buildProductDetailsBadgeItems({ product });

  return (
    <div className="product-details-modal__price-badge-row">
      <div className="product-details-modal__price-badge-row-scroll">
        <div className="product-details-modal__price-badge-row-track">
          {items.map((item) => {
            if (item.kind === "original") {
              return (
                <div
                  key={item.key}
                  className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--original"
                  aria-label={PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA}
                >
                  <CircleCheck
                    className="product-details-modal__meta-info-chip-icon"
                    size={14}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </div>
              );
            }

            if (item.kind === "raffle") {
              return (
                <div
                  key={item.key}
                  className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--raffle"
                  role="status"
                  style={{
                    backgroundColor: PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle.backgroundColor,
                    color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle.color,
                  }}
                >
                  <span>{item.label}</span>
                </div>
              );
            }

            if (item.kind === "listingOrigin") {
              const ListingOriginIcon = item.Icon;
              return (
                <div
                  key={item.key}
                  className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--listing-origin"
                  aria-label={PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_SLOT_ARIA}
                  style={{
                    backgroundColor:
                      PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin.backgroundColor,
                    color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin.color,
                  }}
                >
                  <ListingOriginIcon
                    className="product-details-modal__meta-info-chip-icon"
                    size={14}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </div>
              );
            }

            return (
              <div
                key={item.key}
                className="product-details-modal__meta-info-chip product-details-modal__meta-info-chip--price-status"
                aria-label={PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA}
                style={{
                  backgroundColor: item.backgroundColor,
                  color: item.color,
                }}
              >
                <Tag
                  className="product-details-modal__meta-info-chip-icon"
                  size={14}
                  aria-hidden
                />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
