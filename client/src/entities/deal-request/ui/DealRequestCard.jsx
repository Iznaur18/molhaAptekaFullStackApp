import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  DEAL_REQUEST_ACTION_ACCEPT,
  DEAL_REQUEST_ACTION_CANCEL,
  DEAL_REQUEST_ACTION_CONFIRM,
  DEAL_REQUEST_ACTION_DECLINE,
  DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH,
  DEAL_REQUEST_OPEN_STATUSES,
  DEAL_REQUEST_OUTCOME_COMPLETED,
  DEAL_REQUEST_OUTCOMES,
  DEAL_REQUEST_ROLE_SELLER,
  DEAL_REQUEST_STATUS_COMPLETED,
  DEAL_REQUEST_STATUS_LABELS_RU,
  isDealRequestContactOpen,
} from "@molha/api-contract";
import { useState } from "react";

import { DEAL_REQUESTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  formatDealRequestTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../lib/dealRequestTime.js";

import "./DealRequestCard.css";

/** @param {string} action @param {string} kind */
const actionLabel = (action, kind) => {
  const label = DEAL_REQUESTS_PAGE_UI.ACTION[action];
  return typeof label === "string" ? label : label[kind];
};

/** @param {string} action */
const actionButtonClass = (action) => {
  if (action === DEAL_REQUEST_ACTION_ACCEPT || action === DEAL_REQUEST_ACTION_CONFIRM) {
    return "app-btn app-btn--primary";
  }
  if (action === DEAL_REQUEST_OUTCOME_COMPLETED) {
    return "app-btn app-btn--success";
  }
  if (action === DEAL_REQUEST_ACTION_DECLINE || action === DEAL_REQUEST_ACTION_CANCEL) {
    return "app-btn app-btn--danger";
  }
  return "app-btn app-btn--secondary";
};

/**
 * @param {{
 *   request: import("zod").infer<typeof import("@molha/api-contract").dealRequestSchema>;
 *   isPending: boolean;
 *   error?: string;
 *   onAction: (action: string, body?: Record<string, unknown>) => void;
 * }} props
 */
export function DealRequestCard({ request, isPending, error = "", onAction }) {
  const [openForm, setOpenForm] = useState(
    /** @type {"accept" | "decline" | null} */ (null),
  );
  const [agreedValue, setAgreedValue] = useState(() =>
    toDateTimeLocalValue(request.preferredAt),
  );
  const [priceValue, setPriceValue] = useState(() =>
    request.product.priceRub ? String(request.product.priceRub) : "",
  );
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");

  const isSeller = request.role === DEAL_REQUEST_ROLE_SELLER;
  const isService = request.kind === CATEGORY_DEAL_TYPE_SERVICE;
  const isOpen = DEAL_REQUEST_OPEN_STATUSES.includes(request.status);
  const { phone } = request.counterparty;
  const phoneText =
    phone ??
    (isDealRequestContactOpen(request.status) || (!isSeller && !isService)
      ? DEAL_REQUESTS_PAGE_UI.PHONE_MISSING
      : DEAL_REQUESTS_PAGE_UI.PHONE_LOCKED);

  const handleAction = (action) => {
    setFormError("");
    if (
      action === DEAL_REQUEST_ACTION_ACCEPT ||
      action === DEAL_REQUEST_ACTION_DECLINE
    ) {
      setOpenForm(action);
      return;
    }
    if (DEAL_REQUEST_OUTCOMES.includes(action)) {
      onAction("outcome", { outcome: action });
      return;
    }
    onAction(action);
  };

  const submitAccept = (event) => {
    event.preventDefault();
    const quotedPriceRub = Math.floor(Number(priceValue));
    if (isService && !(quotedPriceRub > 0)) {
      setFormError(DEAL_REQUESTS_PAGE_UI.ACCEPT_PRICE_REQUIRED);
      return;
    }
    const agreedAt = fromDateTimeLocalValue(agreedValue);
    onAction(DEAL_REQUEST_ACTION_ACCEPT, {
      ...(agreedAt ? { agreedAt } : {}),
      ...(isService ? { quotedPriceRub } : {}),
    });
    setOpenForm(null);
  };

  const submitDecline = (event) => {
    event.preventDefault();
    onAction(DEAL_REQUEST_ACTION_DECLINE, { reason: reason.trim() });
    setOpenForm(null);
  };

  return (
    <li
      className={["deal-request-card", isOpen ? "" : "deal-request-card_closed"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="deal-request-card__head">
        <span className="deal-request-card__kind">
          {DEAL_REQUESTS_PAGE_UI.KIND[request.kind]}
        </span>
        <span
          className={`deal-request-card__status deal-request-card__status_${request.status}`}
        >
          {DEAL_REQUEST_STATUS_LABELS_RU[request.status]}
        </span>
      </div>

      <a className="deal-request-card__product" href={`/product/${request.product.id}`}>
        {request.product.name || DEAL_REQUESTS_PAGE_UI.OPEN_PRODUCT}
      </a>
      {request.product.priceRub != null ? (
        <p className="deal-request-card__price">
          {formatPriceRub(request.product.priceRub)}
        </p>
      ) : null}

      <dl className="deal-request-card__facts">
        <div>
          <dt>{DEAL_REQUESTS_PAGE_UI.ROLE_COUNTERPARTY[request.role]}</dt>
          <dd>
            <a href={`/user/${request.counterparty.id}`}>{request.counterparty.name}</a>
          </dd>
        </div>
        <div>
          <dt>{DEAL_REQUESTS_PAGE_UI.LABEL_PHONE}</dt>
          <dd>{phone ? <a href={`tel:${phone}`}>{phone}</a> : phoneText}</dd>
        </div>
        <div>
          <dt>
            {request.agreedAt
              ? DEAL_REQUESTS_PAGE_UI.LABEL_AGREED
              : DEAL_REQUESTS_PAGE_UI.LABEL_PREFERRED}
          </dt>
          <dd>{formatDealRequestTime(request.agreedAt ?? request.preferredAt)}</dd>
        </div>
        {request.quotedPriceRub != null ? (
          <div>
            <dt>{DEAL_REQUESTS_PAGE_UI.LABEL_PRICE}</dt>
            <dd>{formatPriceRub(request.quotedPriceRub)}</dd>
          </div>
        ) : null}
        {request.address ? (
          <div>
            <dt>{DEAL_REQUESTS_PAGE_UI.LABEL_ADDRESS}</dt>
            <dd>{request.address}</dd>
          </div>
        ) : null}
        {request.comment ? (
          <div>
            <dt>{DEAL_REQUESTS_PAGE_UI.LABEL_COMMENT}</dt>
            <dd>{request.comment}</dd>
          </div>
        ) : null}
        {request.declineReason ? (
          <div>
            <dt>{DEAL_REQUESTS_PAGE_UI.LABEL_DECLINE_REASON}</dt>
            <dd>{request.declineReason}</dd>
          </div>
        ) : null}
      </dl>

      {request.expiresAt ? (
        <p className="deal-request-card__hint">
          {(isSeller
            ? DEAL_REQUESTS_PAGE_UI.EXPIRES
            : DEAL_REQUESTS_PAGE_UI.EXPIRES_BUYER)(
            formatDealRequestTime(request.expiresAt),
          )}
        </p>
      ) : null}

      {openForm === DEAL_REQUEST_ACTION_ACCEPT ? (
        <form className="deal-request-card__form" onSubmit={submitAccept}>
          <p className="deal-request-card__form-title">
            {DEAL_REQUESTS_PAGE_UI.ACCEPT_TITLE}
          </p>
          <label className="deal-request-card__field">
            <span>{DEAL_REQUESTS_PAGE_UI.ACCEPT_TIME}</span>
            <input
              type="datetime-local"
              value={agreedValue}
              min={toDateTimeLocalValue(new Date())}
              required
              onChange={(event) => setAgreedValue(event.target.value)}
            />
          </label>
          {isService ? (
            <label className="deal-request-card__field">
              <span>{DEAL_REQUESTS_PAGE_UI.ACCEPT_PRICE}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={priceValue}
                onChange={(event) => setPriceValue(event.target.value)}
              />
            </label>
          ) : null}
          {formError ? (
            <p className="deal-request-card__error" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="deal-request-card__actions">
            <button type="submit" className="app-btn app-btn--primary">
              {DEAL_REQUESTS_PAGE_UI.ACCEPT_SUBMIT}
            </button>
            <button
              type="button"
              className="app-btn app-btn--cancel"
              onClick={() => setOpenForm(null)}
            >
              {DEAL_REQUESTS_PAGE_UI.FORM_CANCEL}
            </button>
          </div>
        </form>
      ) : null}

      {openForm === DEAL_REQUEST_ACTION_DECLINE ? (
        <form className="deal-request-card__form" onSubmit={submitDecline}>
          <label className="deal-request-card__field">
            <span>{DEAL_REQUESTS_PAGE_UI.DECLINE_TITLE}</span>
            <input
              type="text"
              value={reason}
              maxLength={DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH}
              placeholder={DEAL_REQUESTS_PAGE_UI.DECLINE_REASON_PLACEHOLDER}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <div className="deal-request-card__actions">
            <button type="submit" className="app-btn app-btn--danger">
              {DEAL_REQUESTS_PAGE_UI.DECLINE_SUBMIT}
            </button>
            <button
              type="button"
              className="app-btn app-btn--cancel"
              onClick={() => setOpenForm(null)}
            >
              {DEAL_REQUESTS_PAGE_UI.FORM_CANCEL}
            </button>
          </div>
        </form>
      ) : null}

      {openForm === null && request.actions.length > 0 ? (
        <>
          <div className="deal-request-card__actions">
            {request.actions.map((action) => (
              <button
                key={action}
                type="button"
                className={actionButtonClass(action)}
                disabled={isPending}
                onClick={() => handleAction(action)}
              >
                {actionLabel(action, request.kind)}
              </button>
            ))}
          </div>
          {request.kind === CATEGORY_DEAL_TYPE_VIEWING &&
          request.actions.includes(DEAL_REQUEST_OUTCOME_COMPLETED) ? (
            <p className="deal-request-card__hint">
              {DEAL_REQUESTS_PAGE_UI.COMPLETED_VIEWING_HINT}
            </p>
          ) : null}
        </>
      ) : null}

      {!isSeller && request.status === DEAL_REQUEST_STATUS_COMPLETED ? (
        <div className="deal-request-card__actions">
          <a
            className="app-btn app-btn--secondary"
            href={`/product/${request.product.id}`}
          >
            {DEAL_REQUESTS_PAGE_UI.LEAVE_REVIEW}
          </a>
        </div>
      ) : null}

      {error ? (
        <p className="deal-request-card__error" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
