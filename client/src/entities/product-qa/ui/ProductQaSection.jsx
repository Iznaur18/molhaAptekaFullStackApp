import { useState } from "react";

import { PRODUCT_QA_UI } from "../../../shared/config/appUiCopy.js";
import { useProductQuestionMutations } from "../model/useProductQuestionMutations.js";
import { useProductQuestionsQuery } from "../model/useProductQuestionsQuery.js";
import { PRODUCT_QUESTION_TEXT_MAX_LENGTH } from "../model/constants.js";
import { ProductQaSummary } from "./ProductQaSummary.jsx";
import { ProductQuestionForm } from "./ProductQuestionForm.jsx";
import { ProductQuestionListItem } from "./ProductQuestionListItem.jsx";

import "./ProductQaSection.css";

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   isOwnProduct?: boolean;
 *   onRequestLogin?: () => void;
 *   embeddedInTab?: boolean;
 * }} props
 */
export function ProductQaSection({
  productId,
  isAuthorized,
  isOwnProduct = false,
  onRequestLogin = () => {},
  embeddedInTab = false,
}) {
  const {
    summaryQuery,
    questionsQuery,
    questions,
    totalPages,
    currentPage,
    isLoading,
    isLoadingMore,
    error,
  } = useProductQuestionsQuery({ productId });
  const { askMutation, answerMutation, deleteMutation, hideMutation } =
    useProductQuestionMutations(productId);

  const summary = summaryQuery.data ?? null;
  const [askError, setAskError] = useState("");
  const [answerError, setAnswerError] = useState("");

  const handleAsk = async (text) => {
    setAskError("");
    try {
      await askMutation.mutateAsync({ text });
    } catch (e) {
      setAskError(e instanceof Error ? e.message : PRODUCT_QA_UI.ASK_SUBMIT);
    }
  };

  const handleAnswer = async (questionId, text) => {
    setAnswerError("");
    try {
      await answerMutation.mutateAsync({ questionId, text });
    } catch (e) {
      setAnswerError(e instanceof Error ? e.message : PRODUCT_QA_UI.ANSWER_SUBMIT);
      throw e;
    }
  };

  const handleHide = (questionId) => {
    hideMutation.mutate(questionId);
  };

  const handleDelete = (questionId) => {
    deleteMutation.mutate(questionId);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || currentPage >= totalPages) {
      return;
    }
    await questionsQuery.fetchNextPage();
  };

  const rootClassName = [
    "product-qa-section",
    embeddedInTab ? "product-qa-section--tab" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <section className={rootClassName} aria-label={PRODUCT_QA_UI.SECTION_TITLE}>
        <p className="product-qa-section__state">{PRODUCT_QA_UI.LOADING}</p>
      </section>
    );
  }

  if (error && !summary) {
    return (
      <section className={rootClassName} aria-label={PRODUCT_QA_UI.SECTION_TITLE}>
        <p className="product-qa-section__state" role="alert">
          {error instanceof Error ? error.message : PRODUCT_QA_UI.LOADING}
        </p>
      </section>
    );
  }

  const isActionPending = hideMutation.isPending || deleteMutation.isPending;

  const renderComposer = () => {
    if (isOwnProduct) {
      return null;
    }
    if (!isAuthorized) {
      return (
        <button
          type="button"
          className="app-btn app-btn--primary product-qa-section__login"
          onClick={onRequestLogin}
        >
          {PRODUCT_QA_UI.LOGIN_TO_ASK}
        </button>
      );
    }
    if (summary && !summary.canAsk) {
      if (summary.remaining <= 0) {
        return (
          <p className="product-qa-section__hint">{PRODUCT_QA_UI.LIMIT_REACHED}</p>
        );
      }
      return null;
    }
    return (
      <div className="product-qa-section__composer">
        <h3 className="product-qa-section__panel-title">{PRODUCT_QA_UI.ASK_TITLE}</h3>
        <ProductQuestionForm
          placeholder={PRODUCT_QA_UI.ASK_PLACEHOLDER}
          submitLabel={PRODUCT_QA_UI.ASK_SUBMIT}
          maxLength={PRODUCT_QUESTION_TEXT_MAX_LENGTH}
          onSubmit={handleAsk}
          isBusy={askMutation.isPending}
          errorMessage={askError}
        />
      </div>
    );
  };

  const emptyLabel = isOwnProduct
    ? PRODUCT_QA_UI.EMPTY_STATE_SELLER
    : PRODUCT_QA_UI.EMPTY_STATE;

  return (
    <section className={rootClassName} aria-label={PRODUCT_QA_UI.SECTION_TITLE}>
      {embeddedInTab ? null : (
        <h2 className="product-qa-section__title">{PRODUCT_QA_UI.SECTION_TITLE}</h2>
      )}

      {summary?.isSeller ? <ProductQaSummary summary={summary} /> : null}

      {renderComposer()}

      {questions.length === 0 ? (
        <p className="product-qa-section__empty">{emptyLabel}</p>
      ) : (
        <ul className="product-qa-section__list">
          {questions.map((question) => (
            <li key={question._id}>
              <ProductQuestionListItem
                question={question}
                isSeller={isOwnProduct}
                onAnswer={handleAnswer}
                onHide={handleHide}
                onDelete={handleDelete}
                isAnswerPending={answerMutation.isPending}
                isActionPending={isActionPending}
                answerError={answerError}
              />
            </li>
          ))}
        </ul>
      )}

      {currentPage < totalPages ? (
        <button
          type="button"
          className="product-qa-section__more"
          disabled={isLoadingMore}
          onClick={() => void handleLoadMore()}
        >
          {isLoadingMore ? PRODUCT_QA_UI.LOADING : PRODUCT_QA_UI.LOAD_MORE}
        </button>
      ) : null}
    </section>
  );
}
