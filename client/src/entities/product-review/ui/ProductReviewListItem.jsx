import { UserDataConfirmedBadge } from "../../user/ui/UserDataConfirmedBadge.jsx";
import { UserPremiumVerifiedBadge } from "../../user/ui/UserPremiumVerifiedBadge.jsx";
import { ProductReviewStars } from "./ProductReviewStars.jsx";

import "./ProductReviewListItem.css";

/**
 * Паритет с mobile `ProductReviewListItem`.
 *
 * @param {{ review: import('../model/types.js').ProductReviewFromApi }} props
 */
export function ProductReviewListItem({ review }) {
  const authorName = review.author?.userName?.trim() || "Покупатель";
  const createdAtMs = review.createdAt ? new Date(review.createdAt).getTime() : Number.NaN;
  const hasValidDate = Number.isFinite(createdAtMs);
  const dateLabel = hasValidDate
    ? new Date(createdAtMs).toLocaleDateString("ru-RU")
    : "";
  const isPremium = review.author?.isPremiumUser === true;

  return (
    <article className="product-review-item">
      <header className="product-review-item__header">
        <div className="product-review-item__author">
          <span className="product-review-item__name">{authorName}</span>
          {isPremium ? <UserPremiumVerifiedBadge size={16} /> : null}
          {review.author?.isUserDataConfirmed ? (
            <UserDataConfirmedBadge size={16} />
          ) : null}
        </div>
        {hasValidDate ? (
          <time className="product-review-item__date" dateTime={String(review.createdAt)}>
            {dateLabel}
          </time>
        ) : null}
      </header>
      <ProductReviewStars value={Number(review.rating) || 0} size="sm" />
      {review.text?.trim() ? (
        <p className="product-review-item__text">{review.text.trim()}</p>
      ) : null}
    </article>
  );
}
