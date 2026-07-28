import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { pluralizeRuReview } from "../../../shared/lib/pluralizeRuReview.js";

/**
 * @param {number} averageRating
 * @param {number} reviewCount
 * @returns {{ rating: number; count: number } | null}
 */
export function getProductReviewRatingParts(averageRating, reviewCount) {
  const count = Number(reviewCount) || 0;
  if (count <= 0) {
    return null;
  }
  const avg = Number(averageRating) || 0;
  return {
    rating: Math.round(avg * 10) / 10,
    count,
  };
}

/**
 * @param {number} averageRating
 * @param {number} reviewCount
 */
export function formatProductReviewRatingLine(averageRating, reviewCount) {
  const parts = getProductReviewRatingParts(averageRating, reviewCount);
  if (!parts) {
    return "";
  }
  return PRODUCT_REVIEW_UI.RATING_LINE.replace("{rating}", String(parts.rating)).replace(
    "{count}",
    `${parts.count} ${pluralizeRuReview(parts.count)}`,
  );
}

/**
 * @param {number} reviewCount
 */
export function formatProductReviewCountLabel(reviewCount) {
  const count = Number(reviewCount) || 0;
  if (count <= 0) {
    return "";
  }
  return `${count} ${pluralizeRuReview(count)}`;
}
