import { useCallback, useEffect, useState } from "react";

import { fetchMyFollowing } from "../../../entities/user-follow/api/fetchMyFollowing.js";
import { SubscriptionUserRow } from "./SubscriptionUserRow.jsx";
import { SUBSCRIPTIONS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./SubscriptionsPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onUserClick: (userId: string) => void;
 * }} props
 */
export function SubscriptionsPage({
  isAuthorized,
  onRequestLogin,
  onUserClick,
}) {
  const [users, setUsers] = useState(
    /** @type {import('../../../entities/user/model/types.js').UserSearchListItem[]} */ ([]),
  );
  const [status, setStatus] = useState(
    /** @type {{ kind: 'idle' | 'loading' | 'error'; message?: string }} */ ({
      kind: "loading",
    }),
  );

  const load = useCallback(async () => {
    if (!isAuthorized) {
      setUsers([]);
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const { users: rows } = await fetchMyFollowing({ page: 1, limit: 50 });
      setUsers(rows);
      setStatus({ kind: "idle" });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : SUBSCRIPTIONS_PAGE_UI.FETCH_FALLBACK;
      setStatus({ kind: "error", message });
    }
  }, [isAuthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAuthorized) {
    return (
      <section className="subscriptions-page">
        <p className="subscriptions-page__hint">{SUBSCRIPTIONS_PAGE_UI.LOGIN_HINT}</p>
        <button type="button" className="subscriptions-page__login" onClick={onRequestLogin}>
          {SUBSCRIPTIONS_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (status.kind === "loading") {
    return (
      <p className="subscriptions-page__state">{SUBSCRIPTIONS_PAGE_UI.LOADING}</p>
    );
  }

  if (status.kind === "error") {
    return (
      <p className="subscriptions-page__state subscriptions-page__state_error" role="alert">
        {status.message}
      </p>
    );
  }

  if (users.length === 0) {
    return (
      <p className="subscriptions-page__state">{SUBSCRIPTIONS_PAGE_UI.EMPTY}</p>
    );
  }

  return (
    <ul className="subscriptions-page__list" role="list">
      {users.map((user) => (
        <li key={user._id} role="listitem">
          <SubscriptionUserRow user={user} onRowClick={onUserClick} />
        </li>
      ))}
    </ul>
  );
}
