import { useMyFollowingQuery } from "../../../entities/user-follow/model/useMyFollowingQuery.js";
import { SUBSCRIPTIONS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { pluralizeRu } from "../../../shared/lib/pluralizeRu.js";
import { ProfileListHero } from "../../../shared/ui/ProfileListHero/ProfileListHero.jsx";
import { SubscriptionUserRow } from "./SubscriptionUserRow.jsx";

import "./SubscriptionsPage.css";

function SubscriptionsHeroIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      />
      <circle cx="9" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

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

  const hero = (
    <ProfileListHero
      tone="action"
      caption={SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION}
      count={users.length}
      unit={pluralizeRu(users.length, SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS)}
      info={SUBSCRIPTIONS_PAGE_UI.HERO_INFO}
      icon={<SubscriptionsHeroIcon />}
    />
  );

  if (!isAuthorized) {
    return (
      <section className="subscriptions-page subscriptions-page_centered">
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
      <section className="subscriptions-page subscriptions-page_empty">
        <div className="subscriptions-page__header">{hero}</div>
        <div className="subscriptions-page__empty-body">
          <p className="subscriptions-page__state">{SUBSCRIPTIONS_PAGE_UI.EMPTY}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="subscriptions-page">
      <div className="subscriptions-page__header">{hero}</div>
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
