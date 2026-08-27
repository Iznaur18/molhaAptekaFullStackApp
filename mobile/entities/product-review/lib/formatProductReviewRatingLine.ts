import { PRODUCT_REVIEW_UI } from "@/shared/config";
import { pluralizeRuReview } from "@/shared/lib/pluralizeRuReview";

export type ProductReviewRatingParts = {
  rating: number;
  count: number;
};

export const getProductReviewRatingParts = (
  averageRating: unknown,
  reviewCount: unknown,
): ProductReviewRatingParts | null => {
  const count = Number(reviewCount) || 0;
  if (count <= 0) {
    return null;
  }
  const avg = Number(averageRating) || 0;
  return {
    rating: Math.round(avg * 10) / 10,
    count,
  };
};

export const formatProductReviewRatingLine = (
  averageRating: unknown,
  reviewCount: unknown,
): string => {
  const parts = getProductReviewRatingParts(averageRating, reviewCount);
  if (!parts) {
    return "";
  }
  return PRODUCT_REVIEW_UI.RATING_LINE.replace("{rating}", String(parts.rating)).replace(
    "{count}",
    `${parts.count} ${pluralizeRuReview(parts.count)}`,
  );
};

export const formatProductReviewCountLabel = (reviewCount: unknown): string => {
  const count = Number(reviewCount) || 0;
  if (count <= 0) {
    return "";
  }
  return `${count} ${pluralizeRuReview(count)}`;
};
