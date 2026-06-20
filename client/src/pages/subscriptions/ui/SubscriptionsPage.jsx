import { useMyFollowingQuery } from "../../../entities/user-follow/model/useMyFollowingQuery.js";
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
export function SubscriptionsPage({ isAuthorized, onRequestLogin, onUserClick }) {
  const followingQuery = useMyFollowingQuery({ enabled: isAuthorized });
  const users = followingQuery.data?.users ?? [];
  const status = !isAuthorized
    ? { kind: "idle" }
    : followingQuery.isPending
      ? { kind: "loading" }
      : followingQuery.isError
        ? {
            kind: "error",
            message:
              followingQuery.error instanceof Error
                ? followingQuery.error.message
                : SUBSCRIPTIONS_PAGE_UI.FETCH_FALLBACK,
          }
        : { kind: "idle" };

  if (!isAuthorized) {
    return (
      <section className="subscriptions-page">
        <p className="subscriptions-page__hint">{SUBSCRIPTIONS_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="subscriptions-page__login"
          onClick={onRequestLogin}
        >
          {SUBSCRIPTIONS_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (status.kind === "loading") {
    return (
      <section className="subscriptions-page">
        <p className="subscriptions-page__state">{SUBSCRIPTIONS_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (status.kind === "error") {
    return (
      <section className="subscriptions-page">
        <p
          className="subscriptions-page__state subscriptions-page__state_error"
          role="alert"
        >
          {status.message}
        </p>
      </section>
    );
  }

  if (users.length === 0) {
    return (
      <section className="subscriptions-page">
        <p className="subscriptions-page__state">{SUBSCRIPTIONS_PAGE_UI.EMPTY}</p>
      </section>
    );
  }

  return (
    <section className="subscriptions-page">
      <ul className="subscriptions-page__list" role="list">
        {users.map((user) => (
          <li key={user._id} role="listitem">
            <SubscriptionUserRow user={user} onRowClick={onUserClick} />
          </li>
        ))}
      </ul>
    </section>
  );
}
