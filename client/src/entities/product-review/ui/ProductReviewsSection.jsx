import { useCallback, useEffect, useState } from "react";

import { ProductPriceOfferHintMessage } from "../../product-price-offer/ui/ProductPriceOfferHintMessage.jsx";
import { deleteMyProductReview } from "../api/deleteMyProductReview.js";
import { fetchProductReviewSummary } from "../api/fetchProductReviewSummary.js";
import { fetchProductReviewsPage } from "../api/fetchProductReviewsPage.js";
import { patchMyProductReview } from "../api/patchMyProductReview.js";
import { submitProductReview } from "../api/submitProductReview.js";
import { formatProductReviewRatingLine } from "../lib/formatProductReviewRatingLine.js";
import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { ProductReviewForm } from "./ProductReviewForm.jsx";
import { ProductReviewListItem } from "./ProductReviewListItem.jsx";

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
  const [summary, setSummary] = useState(
    /** @type {import('../model/types.js').ProductReviewSummary | null} */ (null),
  );
  const [reviews, setReviews] = useState(
    /** @type {import('../model/types.js').ProductReviewFromApi[]} */ ([]),
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const applyStats = useCallback(
    (averageRating, reviewCount) => {
      onStatsChange?.({
        averageRating: Number(averageRating) || 0,
        reviewCount: Number(reviewCount) || 0,
      });
    },
    [onStatsChange],
  );

  const reloadAll = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [nextSummary, firstPage] = await Promise.all([
        fetchProductReviewSummary(productId),
        fetchProductReviewsPage(productId, { page: 1 }),
      ]);
      setSummary(nextSummary);
      setReviews(firstPage.reviews);
      setPage(1);
      setTotalPages(firstPage.pagination.totalPages);
      applyStats(nextSummary.averageRating, nextSummary.reviewCount);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.LOADING);
    } finally {
      setIsLoading(false);
    }
  }, [applyStats, productId]);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  useEffect(() => {
    setIsEditingMyReview(false);
  }, [productId]);

  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchProductReviewsPage(productId, { page: nextPage });
      setReviews((prev) => [...prev, ...data.reviews]);
      setPage(nextPage);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.LOADING);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmitNew = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const data = await submitProductReview(productId, payload);
      applyStats(data.averageRating, data.reviewCount);
      await reloadAll();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : PRODUCT_REVIEW_UI.SUBMIT,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const data = await patchMyProductReview(productId, payload);
      applyStats(data.averageRating, data.reviewCount);
      await reloadAll();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PRODUCT_REVIEW_UI.SAVE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(PRODUCT_REVIEW_UI.DELETE_CONFIRM)) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const data = await deleteMyProductReview(productId);
      applyStats(data.averageRating, data.reviewCount);
      setIsEditingMyReview(false);
      await reloadAll();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : PRODUCT_REVIEW_UI.DELETE,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLine = summary
    ? formatProductReviewRatingLine(summary.averageRating, summary.reviewCount)
    : "";

  const myReviewId = summary?.myReview?._id;
  const visibleReviews = myReviewId
    ? reviews.filter((review) => review._id !== myReviewId)
    : reviews;

  const renderComposer = () => {
    if (isOwnProduct) {
      return null;
    }

    if (summary?.myReview) {
      const showEditForm =
        summary.myReview.canEdit && isEditingMyReview;

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
      {ratingLine ? (
        <p className="product-reviews-section__summary">{ratingLine}</p>
      ) : null}
      {isLoading ? (
        <p className="product-reviews-section__state">{PRODUCT_REVIEW_UI.LOADING}</p>
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
          {page < totalPages ? (
            <button
              type="button"
              className="product-reviews-section__more"
              disabled={isLoadingMore}
              onClick={() => void handleLoadMore()}
            >
              {isLoadingMore
                ? PRODUCT_REVIEW_UI.LOADING
                : PRODUCT_REVIEW_UI.LOAD_MORE}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
