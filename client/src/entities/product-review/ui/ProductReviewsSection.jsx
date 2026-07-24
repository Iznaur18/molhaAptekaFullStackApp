import { useCallback, useEffect, useRef, useState } from "react";

import { useProductReviewMutations } from "../model/useProductReviewMutations.js";
import { useProductReviewsQuery } from "../model/useProductReviewsQuery.js";
import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { ProductReviewForm } from "./ProductReviewForm.jsx";
import { ProductReviewListItem } from "./ProductReviewListItem.jsx";
import { ProductReviewSummary } from "./ProductReviewSummary.jsx";

import "./ProductReviewsSection.css";

/**
 * @param {{ averageRating: number; reviewCount: number }} a
 * @param {{ averageRating: number; reviewCount: number }} b
 */
function isSameReviewStats(a, b) {
  return a.averageRating === b.averageRating && a.reviewCount === b.reviewCount;
}

/**
 * Паритет с mobile `ProductReviewsTab`: summary → мой отзыв → composer → список.
 *
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   isOwnProduct?: boolean;
 *   onRequestLogin?: () => void;
 *   onStatsChange?: (stats: { averageRating: number; reviewCount: number }) => void;
 *   embeddedInTab?: boolean;
 * }} props
 */
export function ProductReviewsSection({
  productId,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct = false,
  onRequestLogin = () => {},
  onStatsChange,
  embeddedInTab = false,
}) {
  const {
    summaryQuery,
    reviewsQuery,
    reviews,
    totalPages,
    currentPage,
    isLoading,
    isLoadingMore,
    error,
  } = useProductReviewsQuery({ productId });
  const { submitMutation } = useProductReviewMutations(productId);
  const summary = summaryQuery.data ?? null;
  const [errorMessage, setErrorMessage] = useState("");
  const isSubmitting = submitMutation.isPending;
  const lastPushedStatsRef = useRef(/** @type {{ averageRating: number; reviewCount: number } | null} */ (null));

  const applyStats = useCallback(
    (averageRating, reviewCount) => {
      const next = {
        averageRating: Number(averageRating) || 0,
        reviewCount: Number(reviewCount) || 0,
      };
      const prev = lastPushedStatsRef.current;
      if (prev && isSameReviewStats(prev, next)) {
        return;
      }
      lastPushedStatsRef.current = next;
      onStatsChange?.(next);
    },
    [onStatsChange],
  );

  useEffect(() => {
    lastPushedStatsRef.current = null;
  }, [productId]);

  useEffect(() => {
    if (summary) {
      applyStats(summary.averageRating, summary.reviewCount);
    }
  }, [applyStats, summary]);

  useEffect(() => {
    setErrorMessage("");
  }, [productId]);

  const handleSubmitNew = async (payload) => {
    setErrorMessage("");
    try {
      const data = await submitMutation.mutateAsync(payload);
      applyStats(data.averageRating, data.reviewCount);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.SUBMIT);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || currentPage >= totalPages) {
      return;
    }
    try {
      await reviewsQuery.fetchNextPage();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.LOADING);
    }
  };

  const myReview = summary?.myReview ?? null;
  const myReviewId = myReview?._id;
  const otherReviews = myReviewId
    ? reviews.filter((review) => review._id !== myReviewId)
    : reviews;

  const renderComposer = () => {
    if (isOwnProduct || myReview) {
      return null;
    }

    if (!isAuthorized) {
      return (
        <button
          type="button"
          className="app-btn app-btn--primary product-reviews-section__login"
          onClick={onRequestLogin}
        >
          {PRODUCT_REVIEW_UI.LOGIN_TO_REVIEW}
        </button>
      );
    }

    if (!isUserDataConfirmed) {
      return (
        <p className="product-reviews-section__hint">
          {PRODUCT_REVIEW_UI.CONFIRMED_DATA_REQUIRED}
        </p>
      );
    }

    if (!summary?.canReview) {
      return (
        <p className="product-reviews-section__hint">{PRODUCT_REVIEW_UI.NOT_DELIVERED}</p>
      );
    }

    return (
      <div className="product-reviews-section__composer">
        <h3 className="product-reviews-section__panel-title">
          {PRODUCT_REVIEW_UI.LEAVE_REVIEW}
        </h3>
        <ProductReviewForm
          submitLabel={PRODUCT_REVIEW_UI.SUBMIT}
          onSubmit={handleSubmitNew}
          isBusy={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>
    );
  };

  const rootClassName = [
    "product-reviews-section",
    embeddedInTab ? "product-reviews-section--tab" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <section
        id="product-details-reviews"
        className={rootClassName}
        aria-label={PRODUCT_REVIEW_UI.SECTION_TITLE}
      >
        <p className="product-reviews-section__state">{PRODUCT_REVIEW_UI.LOADING}</p>
      </section>
    );
  }

  if (error && !summary) {
    return (
      <section
        id="product-details-reviews"
        className={rootClassName}
        aria-label={PRODUCT_REVIEW_UI.SECTION_TITLE}
      >
        <p className="product-reviews-section__state" role="alert">
          {error instanceof Error ? error.message : PRODUCT_REVIEW_UI.LOADING}
        </p>
      </section>
    );
  }

  return (
    <section
      id="product-details-reviews"
      className={rootClassName}
      aria-label={PRODUCT_REVIEW_UI.SECTION_TITLE}
    >
      {embeddedInTab ? null : (
        <h2 className="product-reviews-section__title">
          {PRODUCT_REVIEW_UI.SECTION_TITLE}
        </h2>
      )}

      {summary ? (
        <ProductReviewSummary
          averageRating={summary.averageRating}
          reviewCount={summary.reviewCount}
        />
      ) : null}

      {myReview ? (
        <div className="product-reviews-section__my-review">
          <h3 className="product-reviews-section__subheading">
            {PRODUCT_REVIEW_UI.YOUR_REVIEW}
          </h3>
          <ProductReviewListItem review={myReview} />
        </div>
      ) : null}

      {renderComposer()}

      {otherReviews.length === 0 && !myReview ? (
        <p className="product-reviews-section__empty">{PRODUCT_REVIEW_UI.NO_REVIEWS}</p>
      ) : otherReviews.length > 0 ? (
        <ul className="product-reviews-section__list">
          {otherReviews.map((review) => (
            <li key={review._id}>
              <ProductReviewListItem review={review} />
            </li>
          ))}
        </ul>
      ) : null}

      {currentPage < totalPages ? (
        <button
          type="button"
          className="product-reviews-section__more"
          disabled={isLoadingMore}
          onClick={() => void handleLoadMore()}
        >
          {isLoadingMore ? PRODUCT_REVIEW_UI.LOADING : PRODUCT_REVIEW_UI.LOAD_MORE}
        </button>
      ) : null}
    </section>
  );
}
