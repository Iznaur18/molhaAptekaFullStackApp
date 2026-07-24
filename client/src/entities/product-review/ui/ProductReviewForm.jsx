import { useState } from "react";

import { PRODUCT_REVIEW_TEXT_MAX_LENGTH } from "../model/constants.js";
import { PRODUCT_REVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { ProductReviewStars } from "./ProductReviewStars.jsx";

import "./ProductReviewForm.css";

/**
 * Паритет с mobile composer в `ProductReviewsTab`.
 *
 * @param {{
 *   initialRating?: number;
 *   initialText?: string;
 *   submitLabel: string;
 *   onSubmit: (payload: { rating: number; text: string }) => Promise<void>;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 * }} props
 */
export function ProductReviewForm({
  initialRating = 0,
  initialText = "",
  submitLabel,
  onSubmit,
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
    try {
      await onSubmit({ rating, text: text.trim() });
      setRating(0);
      setText("");
    } catch {
      /* errorMessage приходит снаружи */
    }
  };

  return (
    <form className="product-review-form" onSubmit={handleSubmit}>
      <label className="product-review-form__label">
        {PRODUCT_REVIEW_UI.LABEL_RATING}
        <ProductReviewStars
          value={rating}
          onChange={setRating}
          disabled={isBusy}
          size="lg"
        />
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
      </label>
      {errorMessage ? (
        <p className="product-review-form__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        className="app-btn app-btn--contrast product-review-form__submit"
        disabled={isBusy || rating < 1}
      >
        {submitLabel}
      </button>
    </form>
  );
}
