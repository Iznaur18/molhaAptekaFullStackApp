import { DEAL_REQUEST_ROLE_BUYER, DEAL_REQUEST_ROLE_SELLER } from "@molha/api-contract";
import { useMemo, useState } from "react";

import { useDealRequestActionMutation } from "../../../entities/deal-request/model/useDealRequestMutations.js";
import { useMyDealRequestsQuery } from "../../../entities/deal-request/model/useMyDealRequestsQuery.js";
import { DealRequestCard } from "../../../entities/deal-request/ui/DealRequestCard.jsx";
import { DEAL_REQUESTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";

import "./DealRequestsPage.css";

const TABS = [
  { id: DEAL_REQUEST_ROLE_BUYER, label: DEAL_REQUESTS_PAGE_UI.TAB_BUYER },
  { id: DEAL_REQUEST_ROLE_SELLER, label: DEAL_REQUESTS_PAGE_UI.TAB_SELLER },
];

export function DealRequestsPage() {
  const [role, setRole] = useState(DEAL_REQUEST_ROLE_BUYER);
  const requestsQuery = useMyDealRequestsQuery({ role });
  const actionMutation = useDealRequestActionMutation();
  const [actionError, setActionError] = useState(
    /** @type {{ requestId: string; message: string } | null} */ (null),
  );

  const requests = useMemo(
    () => (requestsQuery.data?.pages ?? []).flatMap((page) => page.requests),
    [requestsQuery.data],
  );
  const pendingRequestId = actionMutation.isPending
    ? actionMutation.variables?.requestId
    : null;

  const handleAction = async (requestId, action, body) => {
    setActionError(null);
    try {
      await actionMutation.mutateAsync({ requestId, action, body });
    } catch (error) {
      setActionError({
        requestId,
        message:
          error instanceof Error
            ? error.message
            : DEAL_REQUESTS_PAGE_UI.ACTION_FALLBACK_ERROR,
      });
    }
  };

  return (
    <section className="deal-requests-page">
      <header className="deal-requests-page__header">
        <h1 className="deal-requests-page__title">{DEAL_REQUESTS_PAGE_UI.TITLE}</h1>
        <p className="deal-requests-page__lead">{DEAL_REQUESTS_PAGE_UI.LEAD}</p>
      </header>

      <ModalSectionTabs
        tabs={TABS}
        activeTabId={role}
        onTabChange={(next) => {
          setActionError(null);
          setRole(next);
        }}
        ariaLabel={DEAL_REQUESTS_PAGE_UI.TABS_ARIA}
      />

      {requestsQuery.isPending ? (
        <p className="deal-requests-page__state" role="status">
          {DEAL_REQUESTS_PAGE_UI.LOADING}
        </p>
      ) : null}

      {requestsQuery.isError ? (
        <div className="deal-requests-page__state" role="alert">
          <p>
            {requestsQuery.error instanceof Error
              ? requestsQuery.error.message
              : DEAL_REQUESTS_PAGE_UI.LOAD_FALLBACK_ERROR}
          </p>
          <button
            type="button"
            className="app-btn app-btn--secondary"
            onClick={() => void requestsQuery.refetch()}
          >
            {DEAL_REQUESTS_PAGE_UI.RETRY}
          </button>
        </div>
      ) : null}

      {requestsQuery.isSuccess && requests.length === 0 ? (
        <p className="deal-requests-page__state">
          {role === DEAL_REQUEST_ROLE_SELLER
            ? DEAL_REQUESTS_PAGE_UI.EMPTY_SELLER
            : DEAL_REQUESTS_PAGE_UI.EMPTY_BUYER}
        </p>
      ) : null}

      {requests.length > 0 ? (
        <ul className="deal-requests-page__list">
          {requests.map((request) => (
            <DealRequestCard
              // Статус в ключе: после действия форма принятия и её черновик
              // не должны пережить смену состояния заявки.
              key={`${request.id}:${request.status}`}
              request={request}
              isPending={pendingRequestId === request.id}
              error={actionError?.requestId === request.id ? actionError.message : ""}
              onAction={(action, body) => void handleAction(request.id, action, body)}
            />
          ))}
        </ul>
      ) : null}

      {requestsQuery.hasNextPage ? (
        <button
          type="button"
          className="app-btn app-btn--secondary deal-requests-page__more"
          disabled={requestsQuery.isFetchingNextPage}
          onClick={() => void requestsQuery.fetchNextPage()}
        >
          {DEAL_REQUESTS_PAGE_UI.LOAD_MORE}
        </button>
      ) : null}
    </section>
  );
}
