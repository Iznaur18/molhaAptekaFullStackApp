import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import {
  PRODUCT_REVIEW_RATING_MAX,
  PRODUCT_REVIEW_RATING_MIN,
} from "../model/constants.js";

import "./ProductReviewStars.css";

/**
 * @param {{
 *   value: number;
 *   onChange?: (value: number) => void;
 *   disabled?: boolean;
 *   size?: 'sm' | 'md';
 * }} props
 */
export function ProductReviewStars({ value, onChange, disabled = false, size = "md" }) {
  const interactive = typeof onChange === "function" && !disabled;
  const stars = [];

  for (
    let star = PRODUCT_REVIEW_RATING_MIN;
    star <= PRODUCT_REVIEW_RATING_MAX;
    star += 1
  ) {
    const filled = star <= value;
    if (interactive) {
      stars.push(
        <button
          key={star}
          type="button"
          className={
            filled
              ? "product-review-stars__star product-review-stars__star--filled"
              : "product-review-stars__star"
          }
          aria-label={PRODUCT_REVIEW_UI.STAR_ARIA.replace("{value}", String(star))}
          onClick={() => onChange(star)}
        >
          ★
        </button>,
      );
    } else {
      stars.push(
        <span
          key={star}
          className={
            filled
              ? "product-review-stars__star product-review-stars__star--filled"
              : "product-review-stars__star"
          }
          aria-hidden="true"
        >
          ★
        </span>,
      );
    }
  }

  return (
    <div
      className={[
        "product-review-stars",
        `product-review-stars--${size}`,
        interactive ? "product-review-stars--interactive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={interactive ? "group" : undefined}
      aria-label={interactive ? PRODUCT_REVIEW_UI.LABEL_RATING : undefined}
    >
      {stars}
    </div>
  );
}
