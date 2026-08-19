import { useState } from "react";

import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "../../product-category-display/lib/resolveProductCategoryDisplay.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "./CuratedCategoryCompactCard.css";

/**
 * @param {{
 *   category: import('../model/types.js').HomeCuratedCategoryFromApi;
 *   onOpen: (category: import('../model/types.js').HomeCuratedCategoryFromApi) => void;
 * }} props
 */
export function CuratedCategoryCompactCard({ category, onOpen }) {
  const [failed, setFailed] = useState(false);
  const resolved = category.imageUrl ? resolveUploadedImageUrl(category.imageUrl) : null;
  const imageUrl =
    failed || !resolved ? PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE : resolved;

  return (
    <button
      type="button"
      className="curated-category-compact-card"
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
      <span className="curated-category-compact-card__label">{category.label}</span>
    </button>
  );
}
