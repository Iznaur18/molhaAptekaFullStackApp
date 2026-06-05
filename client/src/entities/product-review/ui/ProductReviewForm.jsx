import { useState } from "react";

import { ProductPriceOfferHintMessage } from "../../product-price-offer/ui/ProductPriceOfferHintMessage.jsx";
import { PRODUCT_REVIEW_TEXT_MAX_LENGTH } from "../model/constants.js";
import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { ProductReviewStars } from "./ProductReviewStars.jsx";

import "./ProductReviewForm.css";

/**
 * @param {{
 *   initialRating?: number;
 *   initialText?: string;
 *   submitLabel: string;
 *   onSubmit: (payload: { rating: number; text: string }) => Promise<void>;
 *   onDelete?: () => Promise<void>;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 * }} props
 */
export function ProductReviewForm({
  initialRating = 0,
  initialText = "",
  submitLabel,
  onSubmit,
  onDelete,
  isBusy = false,
  errorMessage = "",
}) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating < 1 || isBusy) {
      return;
    }
    await onSubmit({ rating, text: text.trim() });
  };

  const handleDelete = async () => {
    if (!onDelete || isBusy) {
      return;
    }
    await onDelete();
  };

  return (
    <form className="product-review-form" onSubmit={handleSubmit}>
      <label className="product-review-form__label">
        {PRODUCT_REVIEW_UI.LABEL_RATING}
        <ProductReviewStars value={rating} onChange={setRating} disabled={isBusy} />
      </label>
      <label className="product-review-form__label">
        {PRODUCT_REVIEW_UI.LABEL_TEXT}
        <textarea
          className="product-review-form__textarea"
          value={text}
          maxLength={PRODUCT_REVIEW_TEXT_MAX_LENGTH}
          rows={4}
          placeholder={PRODUCT_REVIEW_UI.TEXT_PLACEHOLDER}
          disabled={isBusy}
          onChange={(event) => setText(event.target.value)}
        />
        <span className="product-review-form__meter">
          {PRODUCT_REVIEW_UI.TEXT_CHARS_USED(
            text.length,
            PRODUCT_REVIEW_TEXT_MAX_LENGTH,
          )}
        </span>
      </label>
      {errorMessage ? (
        <ProductPriceOfferHintMessage>{errorMessage}</ProductPriceOfferHintMessage>
      ) : null}
      <div className="product-review-form__actions">
        <button
          type="submit"
          className="product-review-form__submit"
          disabled={isBusy || rating < 1}
        >
          {submitLabel}
        </button>
        {onDelete ? (
          <button
            type="button"
            className="product-review-form__delete"
            disabled={isBusy}
            onClick={() => void handleDelete()}
          >
            {PRODUCT_REVIEW_UI.DELETE}
          </button>
        ) : null}
      </div>
    </form>
  );
}
