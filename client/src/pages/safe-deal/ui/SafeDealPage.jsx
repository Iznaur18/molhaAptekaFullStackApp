import { useEffect, useMemo, useState } from "react";

import {
  isInnLengthValidForLegalForm,
  isValidInn,
  SAFE_DEAL_INN_INVALID_MESSAGE,
  SELLER_INN_LENGTH_BY_LEGAL_FORM,
  SELLER_LEGAL_FORM_IP,
  SELLER_LEGAL_FORM_LABELS_RU,
  SELLER_LEGAL_FORM_OOO,
  SELLER_LEGAL_FORMS,
} from "@molha/api-contract";

import {
  useMySellerSafeDealQuery,
  useSubmitSellerSafeDealMutation,
} from "../../../entities/seller-safe-deal/model/sellerSafeDealQueries.js";
import { SAFE_DEAL_UI } from "../../../shared/config/appUiCopy.js";

import "./SafeDealPage.css";

const STATUS_LABEL = {
  none: SAFE_DEAL_UI.STATUS_NONE,
  pending: SAFE_DEAL_UI.STATUS_PENDING,
  approved: SAFE_DEAL_UI.STATUS_APPROVED,
  rejected: SAFE_DEAL_UI.STATUS_REJECTED,
};

const INN_HINT_BY_LEGAL_FORM = {
  [SELLER_LEGAL_FORM_IP]: SAFE_DEAL_UI.HINT_INN_IP,
  [SELLER_LEGAL_FORM_OOO]: SAFE_DEAL_UI.HINT_INN_OOO,
};

const INN_PLACEHOLDER_BY_LEGAL_FORM = {
  [SELLER_LEGAL_FORM_IP]: SAFE_DEAL_UI.INN_PLACEHOLDER_IP,
  [SELLER_LEGAL_FORM_OOO]: SAFE_DEAL_UI.INN_PLACEHOLDER_OOO,
};

/** Самая длинная форма — 12 цифр у ИП; на неё и режем ввод. */
const INN_MAX_LENGTH = Math.max(...Object.values(SELLER_INN_LENGTH_BY_LEGAL_FORM));

/**
 * Подключение безопасной сделки — обычный раздел профиля, как заявка курьера:
 * продавец остаётся тем же пользователем, просто подтверждённым.
 *
 * Формы «самозанятый» и «физлицо» тут нет намеренно: деньги через площадку
 * уходят только ИП и ООО.
 */
export function SafeDealPage() {
  const safeDealQuery = useMySellerSafeDealQuery();
  const submitMutation = useSubmitSellerSafeDealMutation();

  const [form, setForm] = useState({ legalForm: "", inn: "" });
  const [error, setError] = useState("");

  const safeDeal = safeDealQuery.data;
  const status = safeDeal?.moderationStatus ?? "none";
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isLocked = isPending || isApproved;

  // Переподача после отказа начинается с прежних данных: чаще всего править
  // надо одну цифру, а не вводить всё заново.
  useEffect(() => {
    if (!safeDeal) return;
    setForm({ legalForm: safeDeal.legalForm ?? "", inn: safeDeal.inn ?? "" });
  }, [safeDeal]);

  const handleLegalFormChange = (event) => {
    setForm((prev) => ({ ...prev, legalForm: event.target.value }));
    setError("");
  };

  // Пробелы и дефисы из скопированной выписки чистим молча: они не ошибка ввода.
  const handleInnChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, INN_MAX_LENGTH);
    setForm((prev) => ({ ...prev, inn: digitsOnly }));
    setError("");
  };

  /**
   * Ошибка ИНН до отправки. Ту же проверку делает сервер — здесь она нужна,
   * чтобы опечатка всплыла сразу, а не через сутки отказом модератора.
   */
  const innError = useMemo(() => {
    if (!form.legalForm || !form.inn) return "";
    if (!isInnLengthValidForLegalForm(form.legalForm, form.inn)) {
      return INN_HINT_BY_LEGAL_FORM[form.legalForm] ?? "";
    }
    if (!isValidInn(form.inn)) {
      return SAFE_DEAL_INN_INVALID_MESSAGE;
    }
    return "";
  }, [form.legalForm, form.inn]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await submitMutation.mutateAsync(form);
    } catch (e) {
      setError(e instanceof Error ? e.message : SAFE_DEAL_UI.ERROR_GENERIC);
    }
  };

  if (safeDealQuery.isPending) {
    return (
      <section className="safe-deal-page">
        <p className="safe-deal-page__loading">{SAFE_DEAL_UI.LOADING}</p>
      </section>
    );
  }

  if (safeDealQuery.isError) {
    return (
      <section className="safe-deal-page">
        <p className="safe-deal-page__error" role="alert">
          {safeDealQuery.error instanceof Error
            ? safeDealQuery.error.message
            : SAFE_DEAL_UI.ERROR_GENERIC}
        </p>
      </section>
    );
  }

  const canSubmit =
    !isLocked &&
    !submitMutation.isPending &&
    Boolean(form.legalForm) &&
    Boolean(form.inn) &&
    !innError;

  const innHint = form.legalForm
    ? (INN_HINT_BY_LEGAL_FORM[form.legalForm] ?? "")
    : SAFE_DEAL_UI.HINT_INN_EMPTY;

  return (
    <section className="safe-deal-page">
      <header className="safe-deal-page__header">
        <h2 className="safe-deal-page__title">{SAFE_DEAL_UI.TITLE}</h2>
        <span className={`safe-deal-page__status safe-deal-page__status--${status}`}>
          {STATUS_LABEL[status]}
        </span>
      </header>

      <div className="safe-deal-page__messages">
        <p className="safe-deal-page__intro">{SAFE_DEAL_UI.INTRO}</p>

        <div className="safe-deal-page__why">
          <h3 className="safe-deal-page__section-title">{SAFE_DEAL_UI.WHY_HEADING}</h3>
          <ul className="safe-deal-page__why-list">
            {SAFE_DEAL_UI.WHY_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {isApproved ? (
          <p className="safe-deal-page__approved">{SAFE_DEAL_UI.APPROVED_HINT}</p>
        ) : null}

        {status === "rejected" && safeDeal?.moderationComment ? (
          <p className="safe-deal-page__rejection" role="alert">
            {SAFE_DEAL_UI.REJECTION_REASON}: {safeDeal.moderationComment}
          </p>
        ) : null}
      </div>

      <form className="safe-deal-page__form" onSubmit={handleSubmit}>
        <div className="safe-deal-page__grid">
          <label className="safe-deal-page__field">
            <span>{SAFE_DEAL_UI.FIELD_LEGAL_FORM}</span>
            <select
              value={form.legalForm}
              onChange={handleLegalFormChange}
              disabled={isLocked || submitMutation.isPending}
            >
              <option value="">{SAFE_DEAL_UI.LEGAL_FORM_PLACEHOLDER}</option>
              {SELLER_LEGAL_FORMS.map((legalForm) => (
                <option key={legalForm} value={legalForm}>
                  {SELLER_LEGAL_FORM_LABELS_RU[legalForm]}
                </option>
              ))}
            </select>
          </label>

          <label className="safe-deal-page__field">
            <span>{SAFE_DEAL_UI.FIELD_INN}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.inn}
              onChange={handleInnChange}
              placeholder={
                INN_PLACEHOLDER_BY_LEGAL_FORM[form.legalForm] ??
                SAFE_DEAL_UI.INN_PLACEHOLDER_OOO
              }
              disabled={isLocked || submitMutation.isPending}
              maxLength={INN_MAX_LENGTH}
              aria-invalid={innError ? "true" : undefined}
            />
            <span
              className={`safe-deal-page__hint${innError ? " safe-deal-page__hint--error" : ""}`}
            >
              {innError || innHint}
            </span>
          </label>
        </div>

        <p className="safe-deal-page__legal">{SAFE_DEAL_UI.LEGAL_NOTE}</p>

        {error ? (
          <p className="safe-deal-page__error" role="alert">
            {error}
          </p>
        ) : null}

        {!isApproved ? (
          <button type="submit" className="safe-deal-page__submit" disabled={!canSubmit}>
            {submitMutation.isPending
              ? SAFE_DEAL_UI.SUBMITTING
              : status === "rejected"
                ? SAFE_DEAL_UI.RESUBMIT
                : SAFE_DEAL_UI.SUBMIT}
          </button>
        ) : null}

        {isPending ? (
          <p className="safe-deal-page__pending">{SAFE_DEAL_UI.PENDING_HINT}</p>
        ) : null}
      </form>

      <p className="safe-deal-page__privacy">{SAFE_DEAL_UI.PRIVACY_NOTE}</p>
    </section>
  );
}
