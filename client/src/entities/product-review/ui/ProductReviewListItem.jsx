import { UserDataConfirmedBadge } from "../../user/ui/UserDataConfirmedBadge.jsx";
import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { ProductReviewStars } from "./ProductReviewStars.jsx";

import "./ProductReviewListItem.css";

/**
 * @param {{ review: import('../model/types.js').ProductReviewFromApi }} props
 */
export function ProductReviewListItem({ review }) {
  const authorName = review.author?.userName?.trim() || "Покупатель";
  const dateLabel = new Date(review.createdAt).toLocaleDateString("ru-RU");

  return (
    <article className="product-review-item">
      <header className="product-review-item__header">
        <div className="product-review-item__author">
          <span className="product-review-item__name">{authorName}</span>
          {review.author?.isUserDataConfirmed ? (
            <UserDataConfirmedBadge size={16} />
          ) : null}
        </div>
        <time className="product-review-item__date" dateTime={review.createdAt}>
          {dateLabel}
        </time>
      </header>
      <ProductReviewStars value={review.rating} size="sm" />
      {review.text?.trim() ? (
        <p className="product-review-item__text">{review.text.trim()}</p>
      ) : null}
    </article>
  );
}
