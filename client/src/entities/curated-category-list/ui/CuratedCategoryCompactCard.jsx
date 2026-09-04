import { useState } from "react";
import { Star } from "lucide-react";

import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "../../product-category-display/lib/resolveProductCategoryDisplay.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "./CuratedCategoryCompactCard.css";

/**
 * @param {{
 *   category: import('../model/types.js').HomeCuratedCategoryFromApi;
 *   onOpen: (category: import('../model/types.js').HomeCuratedCategoryFromApi) => void;
 *   showDetails?: boolean;
 * }} props
 */
export function CuratedCategoryCompactCard({
  category,
  onOpen,
  showDetails = false,
}) {
  const [failed, setFailed] = useState(false);
  const resolved = category.imageUrl ? resolveUploadedImageUrl(category.imageUrl) : null;
  const imageUrl =
    failed || !resolved ? PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE : resolved;

  const sellerFullName = String(category.sellerFullName ?? "").trim();
  const ratingAverage =
    typeof category.sellerRatingAverage === "number"
      ? category.sellerRatingAverage
      : null;
  const businessHours = String(category.sellerBusinessHoursLabel ?? "").trim();
  const isPersonal = category.kind === "personal";
  const showTreeLabel = showDetails && !isPersonal;
  const showSellerMeta = showDetails && isPersonal;
  const showRating = showSellerMeta && ratingAverage != null;
  const hasDetails =
    showTreeLabel ||
    (showSellerMeta &&
      (Boolean(sellerFullName) || showRating || Boolean(businessHours)));

  return (
    <button
      type="button"
      className={[
        "curated-category-compact-card",
        showDetails ? "curated-category-compact-card--detailed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onOpen(category)}
      aria-label={category.label}
    >
      <span className="curated-category-compact-card__image-wrap">
        <img
          className="curated-category-compact-card__image"
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      </span>
      {hasDetails ? (
        <span
          className={[
            "curated-category-compact-card__details",
            showSellerMeta ? "curated-category-compact-card__details--row" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {showTreeLabel ? (
            <span className="curated-category-compact-card__label">
              {category.label}
            </span>
          ) : null}
          {showSellerMeta && sellerFullName ? (
            <span className="curated-category-compact-card__seller-name">
              {sellerFullName}
            </span>
          ) : null}
          {showRating ? (
            <span className="curated-category-compact-card__rating">
              <Star
                className="curated-category-compact-card__rating-icon"
                size={14}
                strokeWidth={2.25}
                aria-hidden="true"
              />
              <span>{ratingAverage}</span>
            </span>
          ) : null}
          {showSellerMeta && businessHours ? (
            <span className="curated-category-compact-card__hours">
              {businessHours}
            </span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}
