import { useState } from "react";

import { PRODUCT_QA_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Универсальный композер для вопроса (покупатель) и ответа (продавец).
 *
 * @param {{
 *   placeholder: string;
 *   submitLabel: string;
 *   maxLength: number;
 *   initialText?: string;
 *   onSubmit: (text: string) => Promise<void>;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 *   onCancel?: () => void;
 *   cancelLabel?: string;
 * }} props
 */
export function ProductQuestionForm({
  placeholder,
  submitLabel,
  maxLength,
  initialText = "",
  onSubmit,
  isBusy = false,
  errorMessage = "",
  onCancel,
  cancelLabel,
}) {
  const [text, setText] = useState(initialText);
  const trimmed = text.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!trimmed || isBusy) {
      return;
    }
    try {
      await onSubmit(trimmed);
      setText("");
    } catch {
      /* errorMessage приходит снаружи */
    }
  };

  return (
    <form className="product-qa-form" onSubmit={handleSubmit}>
      <textarea
        className="product-qa-form__textarea"
        value={text}
        maxLength={maxLength}
        rows={3}
        placeholder={placeholder}
        disabled={isBusy}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="product-qa-form__footer">
        <span className="product-qa-form__counter">
          {PRODUCT_QA_UI.TEXT_CHARS_USED(text.length, maxLength)}
        </span>
        <div className="product-qa-form__actions">
          {onCancel ? (
            <button
              type="button"
              className="product-qa-form__cancel"
              disabled={isBusy}
              onClick={onCancel}
            >
              {cancelLabel ?? PRODUCT_QA_UI.ANSWER_CANCEL}
            </button>
          ) : null}
          <button
            type="submit"
            className="app-btn app-btn--contrast product-qa-form__submit"
            disabled={isBusy || !trimmed}
          >
            {submitLabel}
          </button>
        </div>
      </div>
      {errorMessage ? (
        <p className="product-qa-form__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
