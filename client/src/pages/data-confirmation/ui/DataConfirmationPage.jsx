import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "../../../entities/user-data-confirmation/model/constants.js";
import { useMyDataConfirmationStatusQuery } from "../../../entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery.js";
import { USER_DATA_CONFIRMATION_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./DataConfirmationPage.css";

function UserCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11l2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function StatusOkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function StatusPendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function StatusRejectedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
    </svg>
  );
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onOpenRequest: () => void;
 * }} props
 */
export function DataConfirmationPage({
  isAuthorized,
  onRequestLogin,
  onOpenRequest,
}) {
  const statusQuery = useMyDataConfirmationStatusQuery({ enabled: isAuthorized });

  if (!isAuthorized) {
    return (
      <section className="data-confirmation-page data-confirmation-page_centered">
        <p className="data-confirmation-page__hint">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_HINT}
        </p>
        <button
          type="button"
          className="data-confirmation-page__login app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (statusQuery.isPending) {
    return (
      <section className="data-confirmation-page">
        <p className="data-confirmation-page__state">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOADING}
        </p>
      </section>
    );
  }

  if (statusQuery.isError) {
    const message =
      statusQuery.error instanceof Error
        ? statusQuery.error.message
        : USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.FETCH_FALLBACK;
    return (
      <section className="data-confirmation-page">
        <p
          className="data-confirmation-page__state data-confirmation-page__state_error"
          role="alert"
        >
          {message}
        </p>
      </section>
    );
  }

  const status = statusQuery.data;
  const isUserDataConfirmed = status?.isUserDataConfirmed === true;
  const requestStatus = status?.request?.status ?? null;
  const staffNote =
    status?.request?.status === USER_DATA_CONFIRMATION_STATUS_REJECTED
      ? String(status.request.staffNote ?? "").trim()
      : "";

  const canOpenRequest =
    !isUserDataConfirmed && requestStatus !== USER_DATA_CONFIRMATION_STATUS_PENDING;

  return (
    <section
      className="data-confirmation-page"
      aria-label={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PAGE_ARIA}
    >
      <div
        className="data-confirmation-page__hero"
        aria-label={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}
      >
        <div className="data-confirmation-page__hero-text">
          <h2 className="data-confirmation-page__hero-title">
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}
          </h2>
          <p className="data-confirmation-page__hero-intro">
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_INTRO}
          </p>
        </div>
        <div className="data-confirmation-page__hero-icon" aria-hidden="true">
          <UserCheckIcon />
        </div>
      </div>

      <article className="data-confirmation-page__benefits-card">
        <h3 className="data-confirmation-page__benefits-title">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.BENEFITS_TITLE}
        </h3>
        <ul className="data-confirmation-page__benefits">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_BENEFITS.map((item) => (
            <li key={item} className="data-confirmation-page__benefit-row">
              <span className="data-confirmation-page__benefit-icon" aria-hidden="true">
                <CheckIcon />
              </span>
              <span className="data-confirmation-page__benefit-text">{item}</span>
            </li>
          ))}
        </ul>
        <p className="data-confirmation-page__plan-note">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_NOTE}
        </p>
      </article>

      {isUserDataConfirmed ? (
        <div
          className="data-confirmation-page__status data-confirmation-page__status_ok"
          role="status"
        >
          <span className="data-confirmation-page__status-icon" aria-hidden="true">
            <StatusOkIcon />
          </span>
          <p className="data-confirmation-page__status-text">
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_CONFIRMED}
          </p>
        </div>
      ) : null}

      {!isUserDataConfirmed &&
      requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
        <div
          className="data-confirmation-page__status data-confirmation-page__status_pending"
          role="status"
        >
          <span className="data-confirmation-page__status-icon" aria-hidden="true">
            <StatusPendingIcon />
          </span>
          <p className="data-confirmation-page__status-text">
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_PENDING}
          </p>
        </div>
      ) : null}

      {!isUserDataConfirmed &&
      requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
        <div
          className="data-confirmation-page__status data-confirmation-page__status_rejected"
          role="alert"
        >
          <span className="data-confirmation-page__status-icon" aria-hidden="true">
            <StatusRejectedIcon />
          </span>
          <p className="data-confirmation-page__status-text">
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_REJECTED(staffNote)}
          </p>
        </div>
      ) : null}

      {canOpenRequest ? (
        <button
          type="button"
          className="data-confirmation-page__submit"
          onClick={onOpenRequest}
        >
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.OPEN_REQUEST}
        </button>
      ) : null}
    </section>
  );
}
