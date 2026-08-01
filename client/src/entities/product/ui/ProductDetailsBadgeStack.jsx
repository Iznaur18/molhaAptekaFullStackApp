import { CircleCheck, Tag } from "lucide-react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_DETAILS_BADGE_SOFT_COLORS } from "../lib/productDetailsBadgeSoftPalette.js";
import { buildProductDetailsBadgeItems } from "../lib/buildProductDetailsBadgeItems.js";

import "./product-details-modal/ProductDetailsModalPrice.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   onBadgePress?: (item: {
 *     key: string;
 *     label: string;
 *     kind: string;
 *     origin?: string | null;
 *     priceMarketStatus?: string;
 *   }) => void;
 * }} props
 */
export function ProductDetailsBadgeStack({ product, onBadgePress }) {
  const items = buildProductDetailsBadgeItems({ product });
  const interactive = typeof onBadgePress === "function";

  /**
   * @param {{ key: string; label: string }} item
   * @param {import("react").ReactNode} children
   * @param {string} className
   * @param {Record<string, string> | undefined} style
   * @param {string | undefined} ariaLabel
   */
  const renderChip = (item, children, className, style, ariaLabel) => {
    if (!interactive) {
      return (
        <div
          key={item.key}
          className={className}
          role="status"
          aria-label={ariaLabel}
          style={style}
        >
          {children}
        </div>
      );
    }

    return (
      <button
        key={item.key}
        type="button"
        className={`${className} product-details-modal__meta-info-chip--pressable`}
        aria-label={ariaLabel ?? item.label}
        style={style}
        onClick={() => onBadgePress(item)}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="product-details-modal__price-badge-row">
      <div className="product-details-modal__price-badge-row-scroll">
        <div className="product-details-modal__price-badge-row-track">
          {items.map((item) => {
            if (item.kind === "original") {
              return renderChip(
                item,
                <>
                  <CircleCheck
                    className="product-details-modal__meta-info-chip-icon"
                    size={14}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </>,
                "product-details-modal__meta-info-chip product-details-modal__meta-info-chip--original",
                undefined,
                PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA,
              );
            }

            if (item.kind === "raffle") {
              return renderChip(
                item,
                <span>{item.label}</span>,
                "product-details-modal__meta-info-chip product-details-modal__meta-info-chip--raffle",
                {
                  backgroundColor: PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle.backgroundColor,
                  color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle.color,
                },
                item.label,
              );
            }

            if (item.kind === "affiliate") {
              return renderChip(
                item,
                <span>{item.label}</span>,
                "product-details-modal__meta-info-chip product-details-modal__meta-info-chip--affiliate",
                {
                  backgroundColor:
                    PRODUCT_DETAILS_BADGE_SOFT_COLORS.affiliate.backgroundColor,
                  color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.affiliate.color,
                },
                item.label,
              );
            }

            if (item.kind === "listingOrigin") {
              const ListingOriginIcon = item.Icon;
              return renderChip(
                item,
                <>
                  <ListingOriginIcon
                    className="product-details-modal__meta-info-chip-icon"
                    size={14}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </>,
                "product-details-modal__meta-info-chip product-details-modal__meta-info-chip--listing-origin",
                {
                  backgroundColor:
                    PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin.backgroundColor,
                  color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin.color,
                },
                PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_SLOT_ARIA,
              );
            }

            return renderChip(
              item,
              <>
                <Tag
                  className="product-details-modal__meta-info-chip-icon"
                  size={14}
                  aria-hidden
                />
                <span>{item.label}</span>
              </>,
              "product-details-modal__meta-info-chip product-details-modal__meta-info-chip--price-status",
              {
                backgroundColor: item.backgroundColor,
                color: item.color,
              },
              PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA,
            );
          })}
        </div>
      </div>
    </div>
  );
}
