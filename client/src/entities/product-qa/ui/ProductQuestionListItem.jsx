import { useState } from "react";

import { PRODUCT_QA_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_ANSWER_TEXT_MAX_LENGTH } from "../model/constants.js";
import { ProductQuestionForm } from "./ProductQuestionForm.jsx";

/**
 * @param {string | null | undefined} value
 */
function formatQaDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * @param {{
 *   question: import("../model/types.js").ProductQuestionFromApi;
 *   isSeller?: boolean;
 *   onAnswer?: (questionId: string, text: string) => Promise<void>;
 *   onHide?: (questionId: string) => void | Promise<void>;
 *   onDelete?: (questionId: string) => void | Promise<void>;
 *   isAnswerPending?: boolean;
 *   isActionPending?: boolean;
 *   answerError?: string;
 * }} props
 */
export function ProductQuestionListItem({
  question,
  isSeller = false,
  onAnswer,
  onHide,
  onDelete,
  isAnswerPending = false,
  isActionPending = false,
  answerError = "",
}) {
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isPending = question.status === "pending";
  const answer = question.answer;
  const canAnswer = isSeller && typeof onAnswer === "function";
  const canHide = isSeller && typeof onHide === "function";
  const canDelete = question.canDelete && typeof onDelete === "function";

  const handleAnswerSubmit = async (text) => {
    if (typeof onAnswer !== "function") return;
    await onAnswer(question._id, text);
    setIsAnswerOpen(false);
  };

  const authorName =
    typeof question.author?.userName === "string" && question.author.userName.trim()
      ? question.author.userName.trim()
      : "Пользователь";

  return (
    <article className="product-qa-item">
      <header className="product-qa-item__head">
        <span className="product-qa-item__author">{authorName}</span>
        <span className="product-qa-item__head-meta">
          {question.createdAt ? (
            <span className="product-qa-item__date">
              {formatQaDate(question.createdAt)}
            </span>
          ) : null}
          {isPending ? (
            <span className="product-qa-item__badge" title={PRODUCT_QA_UI.PENDING_HINT}>
              {PRODUCT_QA_UI.PENDING_BADGE}
            </span>
          ) : null}
        </span>
      </header>

      <p className="product-qa-item__question">{question.text}</p>

      {answer ? (
        <div className="product-qa-item__answer">
          <div className="product-qa-item__answer-head">
            <span className="product-qa-item__answer-label">
              {PRODUCT_QA_UI.SELLER_ANSWER_LABEL}
            </span>
            {answer.answeredAt ? (
              <span className="product-qa-item__date">
                {formatQaDate(answer.answeredAt)}
              </span>
            ) : null}
          </div>
          <p className="product-qa-item__answer-text">{answer.text}</p>
        </div>
      ) : null}

      {isPending && question.isMine && !isSeller ? (
        <p className="product-qa-item__hint">{PRODUCT_QA_UI.PENDING_HINT}</p>
      ) : null}

      {(canAnswer || canHide || canDelete) && !isAnswerOpen ? (
        <div className="product-qa-item__actions">
          {canHide ? (
            <button
              type="button"
              className="product-qa-item__action"
              disabled={isActionPending}
              onClick={() => onHide?.(question._id)}
            >
              {PRODUCT_QA_UI.HIDE_ACTION}
            </button>
          ) : null}
          {canDelete ? (
            isDeleteConfirmOpen ? (
              <span className="product-qa-item__confirm">
                <span className="product-qa-item__confirm-text">
                  {PRODUCT_QA_UI.DELETE_CONFIRM}
                </span>
                <button
                  type="button"
                  className="product-qa-item__action product-qa-item__action--danger"
                  disabled={isActionPending}
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    void onDelete?.(question._id);
                  }}
                >
                  {PRODUCT_QA_UI.DELETE_ACTION}
                </button>
                <button
                  type="button"
                  className="product-qa-item__action"
                  disabled={isActionPending}
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  {PRODUCT_QA_UI.ANSWER_CANCEL}
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="product-qa-item__action product-qa-item__action--danger"
                disabled={isActionPending}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                {PRODUCT_QA_UI.DELETE_ACTION}
              </button>
            )
          ) : null}
          {canAnswer ? (
            <button
              type="button"
              className="product-qa-item__action product-qa-item__action--primary"
              disabled={isActionPending}
              onClick={() => setIsAnswerOpen(true)}
            >
              {answer ? PRODUCT_QA_UI.ANSWER_EDIT : PRODUCT_QA_UI.ANSWER_ACTION}
            </button>
          ) : null}
        </div>
      ) : null}

      {isAnswerOpen ? (
        <div className="product-qa-item__answer-form">
          <ProductQuestionForm
            placeholder={PRODUCT_QA_UI.ANSWER_PLACEHOLDER}
            submitLabel={answer ? PRODUCT_QA_UI.ANSWER_SAVE : PRODUCT_QA_UI.ANSWER_SUBMIT}
            maxLength={PRODUCT_ANSWER_TEXT_MAX_LENGTH}
            initialText={answer?.text ?? ""}
            onSubmit={handleAnswerSubmit}
            isBusy={isAnswerPending}
            errorMessage={answerError}
            onCancel={() => setIsAnswerOpen(false)}
          />
        </div>
      ) : null}
    </article>
  );
}
