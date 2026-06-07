import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "../../../entities/user-data-confirmation/model/constants.js";
import { useMyDataConfirmationStatusQuery } from "../../../entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery.js";
import { USER_DATA_CONFIRMATION_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./DataConfirmationPage.css";

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
      <section className="data-confirmation-page">
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
      <p className="data-confirmation-page__state">
        {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOADING}
      </p>
    );
  }

  if (statusQuery.isError) {
    const message =
      statusQuery.error instanceof Error
        ? statusQuery.error.message
        : USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.FETCH_FALLBACK;
    return (
      <p
        className="data-confirmation-page__state data-confirmation-page__state_error"
        role="alert"
      >
        {message}
      </p>
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
      <article className="data-confirmation-page__plan">
        <h2 className="data-confirmation-page__plan-title">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}
        </h2>
        <p className="data-confirmation-page__plan-intro">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_INTRO}
        </p>
        <ul className="data-confirmation-page__benefits">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="data-confirmation-page__plan-note">
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_NOTE}
        </p>
      </article>

      {isUserDataConfirmed ? (
        <p
          className="data-confirmation-page__status data-confirmation-page__status_ok"
          role="status"
        >
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_CONFIRMED}
        </p>
      ) : null}

      {!isUserDataConfirmed &&
      requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
        <p
          className="data-confirmation-page__status data-confirmation-page__status_pending"
          role="status"
        >
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_PENDING}
        </p>
      ) : null}

      {!isUserDataConfirmed &&
      requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
        <p
          className="data-confirmation-page__status data-confirmation-page__status_rejected"
          role="alert"
        >
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_REJECTED(staffNote)}
        </p>
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
