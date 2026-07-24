import {
  formatProductReviewCountLabel,
  formatProductReviewRatingLine,
} from "../lib/formatProductReviewRatingLine.js";
import { ProductReviewStars } from "./ProductReviewStars.jsx";

import "./ProductReviewSummary.css";

/**
 * @param {{
 *   averageRating: number;
 *   reviewCount: number;
 * }} props
 */
export function ProductReviewSummary({ averageRating, reviewCount }) {
  const count = Number(reviewCount) || 0;
  if (count <= 0) {
    return null;
  }

  const avg = Number(averageRating) || 0;
  const displayRating = Math.round(avg * 10) / 10;
  const displayRatingLabel =
    displayRating % 1 === 0 ? String(displayRating) : displayRating.toFixed(1);
  const starsValue = Math.min(5, Math.max(0, Math.round(avg)));
  const ratingLine = formatProductReviewRatingLine(avg, count);
  const countLabel = formatProductReviewCountLabel(count);

  return (
    <div className="product-review-summary" aria-label={ratingLine}>
      <strong className="product-review-summary__score" aria-hidden="true">
        {displayRatingLabel}
      </strong>
      <div className="product-review-summary__meta">
        <ProductReviewStars value={starsValue} size="md" />
        <span className="product-review-summary__count">{countLabel}</span>
      </div>
    </div>
  );
}
