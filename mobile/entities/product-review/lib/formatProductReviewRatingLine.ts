import { PRODUCT_REVIEW_UI } from "@/shared/config";

export const formatProductReviewRatingLine = (
  averageRating: unknown,
  reviewCount: unknown,
): string => {
  const count = Number(reviewCount) || 0;
  if (count <= 0) {
    return "";
  }
  const avg = Number(averageRating) || 0;
  const rounded = Math.round(avg * 10) / 10;
  return PRODUCT_REVIEW_UI.RATING_LINE.replace("{rating}", String(rounded)).replace(
    "{count}",
    String(count),
  );
};
