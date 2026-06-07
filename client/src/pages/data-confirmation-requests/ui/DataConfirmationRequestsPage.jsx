import { useCallback } from "react";

import { usePendingDataConfirmationRequestsQuery } from "../../../entities/user-data-confirmation/model/usePendingDataConfirmationRequestsQuery.js";
import { DataConfirmationRequestCard } from "../../../entities/user-data-confirmation/ui/DataConfirmationRequestCard.jsx";
import {
  API_CLIENT_UI,
  DATA_CONFIRMATION_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./DataConfirmationRequestsPage.css";

/**
 * @param {{
 *   onApplicantClick?: (userId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function DataConfirmationRequestsPage({ onApplicantClick, onQueueChanged }) {
  const requestsQuery = usePendingDataConfirmationRequestsQuery();

  const handleResolved = useCallback(() => {
    onQueueChanged?.();
    void requestsQuery.refetch();
  }, [onQueueChanged, requestsQuery]);

  const requests = requestsQuery.data ?? [];
  const phase = requestsQuery.isPending
    ? "loading"
    : requestsQuery.isError && requests.length === 0
      ? "error"
      : "success";
  const error =
    requestsQuery.error instanceof Error
      ? requestsQuery.error.message
      : API_CLIENT_UI.FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK;

  if (phase === "loading") {
    return (
      <p className="data-confirmation-requests-page__state">
        {DATA_CONFIRMATION_PAGE_UI.LOADING}
      </p>
    );
  }

  if (phase === "error" && requests.length === 0) {
    return (
      <p
        className="data-confirmation-requests-page__state data-confirmation-requests-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="data-confirmation-requests-page__state">
        {DATA_CONFIRMATION_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <ul className="data-confirmation-requests-page__list" role="list">
      {requests.map((request) => (
        <li key={request._id} className="data-confirmation-requests-page__item" role="listitem">
          <DataConfirmationRequestCard
            request={request}
            onOpenUser={onApplicantClick}
            onResolved={handleResolved}
          />
        </li>
      ))}
    </ul>
  );
}
