import { useCallback, useEffect, useState } from "react";

import { ProductPriceOfferHintMessage } from "../../product-price-offer/ui/ProductPriceOfferHintMessage.jsx";
import { useProductReviewMutations } from "../model/useProductReviewMutations.js";
import { useProductReviewsQuery } from "../model/useProductReviewsQuery.js";
import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { ProductReviewForm } from "./ProductReviewForm.jsx";
import { ProductReviewListItem } from "./ProductReviewListItem.jsx";
import { ProductReviewSummary } from "./ProductReviewSummary.jsx";

import "./ProductReviewsSection.css";

/**
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
  const { submitMutation, patchMutation, deleteMutation } =
    useProductReviewMutations(productId);
  const summary = summaryQuery.data ?? null;
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isSubmitting =
    submitMutation.isPending || patchMutation.isPending || deleteMutation.isPending;

  const applyStats = useCallback(
    (averageRating, reviewCount) => {
      onStatsChange?.({
        averageRating: Number(averageRating) || 0,
        reviewCount: Number(reviewCount) || 0,
      });
    },
    [onStatsChange],
  );

  useEffect(() => {
    if (summary) {
      applyStats(summary.averageRating, summary.reviewCount);
    }
  }, [applyStats, summary]);

  useEffect(() => {
    setIsEditingMyReview(false);
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

  const handleSubmitEdit = async (payload) => {
    setErrorMessage("");
    try {
      const data = await patchMutation.mutateAsync(payload);
      applyStats(data.averageRating, data.reviewCount);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.SAVE);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(PRODUCT_REVIEW_UI.DELETE_CONFIRM)) {
      return;
    }
    setErrorMessage("");
    try {
      const data = await deleteMutation.mutateAsync();
      applyStats(data.averageRating, data.reviewCount);
      setIsEditingMyReview(false);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.DELETE);
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

  const myReviewId = summary?.myReview?._id;
  const visibleReviews = myReviewId
    ? reviews.filter((review) => review._id !== myReviewId)
    : reviews;

  const renderComposer = () => {
    if (isOwnProduct) {
      return null;
    }

    if (summary?.myReview) {
      const showEditForm = summary.myReview.canEdit && isEditingMyReview;

      return (
        <div className="product-reviews-section__composer">
          <h3 className="product-reviews-section__subheading">
            {PRODUCT_REVIEW_UI.YOUR_REVIEW}
          </h3>
          {showEditForm ? (
            <>
              <ProductReviewForm
                initialRating={summary.myReview.rating}
                initialText={summary.myReview.text}
                submitLabel={PRODUCT_REVIEW_UI.SAVE}
                onSubmit={async (payload) => {
                  await handleSubmitEdit(payload);
                  setIsEditingMyReview(false);
                }}
                onDelete={handleDelete}
                isBusy={isSubmitting}
                errorMessage={errorMessage}
              />
              <button
                type="button"
                className="product-reviews-section__cancel-edit"
                disabled={isSubmitting}
                onClick={() => {
                  setIsEditingMyReview(false);
                  setErrorMessage("");
                }}
              >
                {PRODUCT_REVIEW_UI.CANCEL_EDIT}
              </button>
            </>
          ) : (
            <>
              <ProductReviewListItem review={summary.myReview} />
              {summary.myReview.canEdit ? (
                <div className="product-reviews-section__my-actions">
                  <button
                    type="button"
                    className="product-reviews-section__edit"
                    disabled={isSubmitting}
                    onClick={() => setIsEditingMyReview(true)}
                  >
                    {PRODUCT_REVIEW_UI.EDIT}
                  </button>
                  <button
                    type="button"
                    className="product-reviews-section__delete"
                    disabled={isSubmitting}
                    onClick={() => void handleDelete()}
                  >
                    {PRODUCT_REVIEW_UI.DELETE}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <button
          type="button"
          className="product-reviews-section__login"
          onClick={onRequestLogin}
        >
          {PRODUCT_REVIEW_UI.LOGIN_TO_REVIEW}
        </button>
      );
    }

    if (!isUserDataConfirmed) {
      return (
        <ProductPriceOfferHintMessage>
          {PRODUCT_REVIEW_UI.CONFIRMED_DATA_REQUIRED}
        </ProductPriceOfferHintMessage>
      );
    }

    if (summary?.canReview) {
      return (
        <div className="product-reviews-section__composer">
          <h3 className="product-reviews-section__subheading">
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
    }

    if (isAuthorized && !summary?.canReview && !summary?.myReview) {
      return (
        <ProductPriceOfferHintMessage>
          {PRODUCT_REVIEW_UI.NOT_DELIVERED}
        </ProductPriceOfferHintMessage>
      );
    }

    return null;
  };

  return (
    <section
      id="product-details-reviews"
      className="product-reviews-section"
      aria-label={PRODUCT_REVIEW_UI.SECTION_TITLE}
    >
      {embeddedInTab ? null : (
        <h2 className="product-reviews-section__title">
          {PRODUCT_REVIEW_UI.SECTION_TITLE}
        </h2>
      )}
      {summary && summary.reviewCount > 0 ? (
        <ProductReviewSummary
          averageRating={summary.averageRating}
          reviewCount={summary.reviewCount}
        />
      ) : null}
      {isLoading ? (
        <p className="product-reviews-section__state">{PRODUCT_REVIEW_UI.LOADING}</p>
      ) : error && !summary ? (
        <p className="product-reviews-section__state" role="alert">
          {error instanceof Error ? error.message : PRODUCT_REVIEW_UI.LOADING}
        </p>
      ) : (
        <>
          {renderComposer()}
          <ul className="product-reviews-section__list">
            {visibleReviews.map((review) => (
              <li key={review._id}>
                <ProductReviewListItem review={review} />
              </li>
            ))}
          </ul>
          {!isLoading && visibleReviews.length === 0 && !summary?.myReview ? (
            <p className="product-reviews-section__state">
              {PRODUCT_REVIEW_UI.NO_REVIEWS}
            </p>
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
        </>
      )}
    </section>
  );
}
