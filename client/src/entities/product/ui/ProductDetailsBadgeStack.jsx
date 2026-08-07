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

  /**
   * @param {{ key: string; label: string }} item
   * @param {{ backgroundColor: string; color: string }} tone
   * @param {string} [ariaLabel]
   */
  const renderSoftTextChip = (item, tone, ariaLabel) =>
    renderChip(
      item,
      <span>{item.label}</span>,
      "product-details-modal__meta-info-chip",
      {
        backgroundColor: tone.backgroundColor,
        color: tone.color,
      },
      ariaLabel ?? item.label,
    );

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
              return renderSoftTextChip(item, PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle);
            }

            if (item.kind === "affiliate") {
              return renderSoftTextChip(
                item,
                PRODUCT_DETAILS_BADGE_SOFT_COLORS.affiliate,
              );
            }

            if (item.kind === "auction") {
              return renderSoftTextChip(
                item,
                PRODUCT_DETAILS_BADGE_SOFT_COLORS.auction,
              );
            }

            if (item.kind === "installment") {
              return renderSoftTextChip(
                item,
                PRODUCT_DETAILS_BADGE_SOFT_COLORS.installment,
              );
            }

            if (item.kind === "wholesale") {
              return renderSoftTextChip(
                item,
                PRODUCT_DETAILS_BADGE_SOFT_COLORS.wholesale,
              );
            }

            if (item.kind === "rental") {
              return renderSoftTextChip(
                item,
                PRODUCT_DETAILS_BADGE_SOFT_COLORS.rental,
              );
            }

            if (item.kind === "nearDistance") {
              return renderSoftTextChip(
                item,
                PRODUCT_DETAILS_BADGE_SOFT_COLORS.nearDistance,
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
