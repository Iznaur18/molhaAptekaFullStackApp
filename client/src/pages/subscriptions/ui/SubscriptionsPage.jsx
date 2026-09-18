import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useMyFollowersQuery } from "../../../entities/user-follow/model/useMyFollowersQuery.js";
import { useMyFollowingQuery } from "../../../entities/user-follow/model/useMyFollowingQuery.js";
import {
  SUBSCRIPTIONS_LIST_FOLLOWERS,
  SUBSCRIPTIONS_LIST_FOLLOWING,
  SUBSCRIPTIONS_LIST_QUERY_PARAM,
} from "../../../entities/user-follow/model/constants.js";
import { SUBSCRIPTIONS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { pluralizeRu } from "../../../shared/lib/pluralizeRu.js";
import { ProfileListHero } from "../../../shared/ui/ProfileListHero/ProfileListHero.jsx";
import { SubscriptionUserRow } from "./SubscriptionUserRow.jsx";

import "./SubscriptionsPage.css";

function SubscriptionsHeroIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
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
 * @param {URLSearchParams} searchParams
 * @returns {typeof SUBSCRIPTIONS_LIST_FOLLOWING | typeof SUBSCRIPTIONS_LIST_FOLLOWERS}
 */
function resolveListMode(searchParams) {
  return searchParams.get(SUBSCRIPTIONS_LIST_QUERY_PARAM) ===
    SUBSCRIPTIONS_LIST_FOLLOWERS
    ? SUBSCRIPTIONS_LIST_FOLLOWERS
    : SUBSCRIPTIONS_LIST_FOLLOWING;
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onUserClick: (userId: string) => void;
 * }} props
 */
export function SubscriptionsPage({ isAuthorized, onRequestLogin, onUserClick }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const listMode = resolveListMode(searchParams);
  const isFollowers = listMode === SUBSCRIPTIONS_LIST_FOLLOWERS;

  const followingQuery = useMyFollowingQuery({
    enabled: isAuthorized && !isFollowers,
  });
  const followersQuery = useMyFollowersQuery({
    enabled: isAuthorized && isFollowers,
  });

  const activeQuery = isFollowers ? followersQuery : followingQuery;
  const users = activeQuery.data?.users ?? [];

  const status = useMemo(() => {
    if (!isAuthorized) {
      return { kind: "idle" };
    }
    if (activeQuery.isPending) {
      return { kind: "loading" };
    }
    if (activeQuery.isError) {
      return {
        kind: "error",
        message:
          activeQuery.error instanceof Error
            ? activeQuery.error.message
            : isFollowers
              ? SUBSCRIPTIONS_PAGE_UI.FETCH_FOLLOWERS_FALLBACK
              : SUBSCRIPTIONS_PAGE_UI.FETCH_FALLBACK,
      };
    }
    return { kind: "idle" };
  }, [isAuthorized, activeQuery, isFollowers]);

  const setListMode = (nextMode) => {
    if (nextMode === SUBSCRIPTIONS_LIST_FOLLOWERS) {
      setSearchParams(
        { [SUBSCRIPTIONS_LIST_QUERY_PARAM]: SUBSCRIPTIONS_LIST_FOLLOWERS },
        { replace: true },
      );
      return;
    }
    setSearchParams({}, { replace: true });
  };

  const hero = (
    <ProfileListHero
      tone="action"
      caption={
        isFollowers
          ? SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION_FOLLOWERS
          : SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION
      }
      count={users.length}
      unit={pluralizeRu(
        users.length,
        isFollowers
          ? SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS_FOLLOWERS
          : SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS,
      )}
      info={
        isFollowers
          ? SUBSCRIPTIONS_PAGE_UI.HERO_INFO_FOLLOWERS
          : SUBSCRIPTIONS_PAGE_UI.HERO_INFO
      }
      icon={<SubscriptionsHeroIcon />}
    />
  );

  const tabs = (
    <div
      className="subscriptions-page__tabs"
      role="tablist"
      aria-label={SUBSCRIPTIONS_PAGE_UI.TABS_ARIA}
    >
      <button
        type="button"
        role="tab"
        aria-selected={!isFollowers}
        className={[
          "subscriptions-page__tab",
          !isFollowers ? "subscriptions-page__tab_active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setListMode(SUBSCRIPTIONS_LIST_FOLLOWING)}
      >
        {SUBSCRIPTIONS_PAGE_UI.TAB_FOLLOWING}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isFollowers}
        className={[
          "subscriptions-page__tab",
          isFollowers ? "subscriptions-page__tab_active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setListMode(SUBSCRIPTIONS_LIST_FOLLOWERS)}
      >
        {SUBSCRIPTIONS_PAGE_UI.TAB_FOLLOWERS}
      </button>
    </div>
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
        {tabs}
        <p className="subscriptions-page__state">{SUBSCRIPTIONS_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (status.kind === "error") {
    return (
      <section className="subscriptions-page">
        {tabs}
        <div className="subscriptions-page__error-block" role="alert">
          <p className="subscriptions-page__state subscriptions-page__state_error">
            {status.message}
          </p>
          <button
            type="button"
            className="subscriptions-page__retry"
            onClick={() => void activeQuery.refetch()}
          >
            {SUBSCRIPTIONS_PAGE_UI.RETRY}
          </button>
        </div>
      </section>
    );
  }

  if (users.length === 0) {
    return (
      <section className="subscriptions-page subscriptions-page_empty">
        {tabs}
        <div className="subscriptions-page__header">{hero}</div>
        <div className="subscriptions-page__empty-body">
          <p className="subscriptions-page__state">
            {isFollowers
              ? SUBSCRIPTIONS_PAGE_UI.EMPTY_FOLLOWERS
              : SUBSCRIPTIONS_PAGE_UI.EMPTY}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="subscriptions-page">
      {tabs}
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
