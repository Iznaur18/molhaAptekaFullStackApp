import { useCallback, useEffect, useState } from "react";

import { fetchPendingDataConfirmationRequests } from "../../../entities/user-data-confirmation/api/fetchPendingDataConfirmationRequests.js";
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
export function DataConfirmationRequestsPage({
  onApplicantClick,
  onQueueChanged,
}) {
  const [phase, setPhase] = useState("loading");
  const [requests, setRequests] = useState(
    /** @type {import('../../../entities/user-data-confirmation/model/types.js').DataConfirmationRequest[]} */ ([]),
  );
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const list = await fetchPendingDataConfirmationRequests();
      setRequests(list);
      setPhase("success");
      onQueueChanged?.();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK,
      );
      setPhase("error");
    }
  }, [onQueueChanged]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

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
    <div className="data-confirmation-requests-page">
      {error ? (
        <p
          className="data-confirmation-requests-page__state data-confirmation-requests-page__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <ul className="data-confirmation-requests-page__list" role="list">
        {requests.map((request) => (
          <li key={request._id} role="listitem">
            <DataConfirmationRequestCard
              request={request}
              onResolved={() => void loadQueue()}
              onOpenUser={(userId) => onApplicantClick?.(userId)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
