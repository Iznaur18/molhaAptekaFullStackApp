import { useMemo, useState } from "react";
import {
  excludeUsersPodiumFromList,
  rankUsersForPodium,
} from "@izibuy/shared-lib";
import { USER_SEARCH_MIN_LENGTH, isUsersSearchInputTooShort } from "@molha/api-contract";

import { useUsersMonthlyLoyaltyPointsQuery } from "../../../entities/user/model/useUsersMonthlyLoyaltyPointsQuery.js";
import { useUsersSearchQuery } from "../../../entities/user/model/useUsersSearchQuery.js";
import { UserListRow } from "../../../entities/user/ui/UserListRow.jsx";
import { USER_SEARCH_INPUT_UI, USERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";
import { UsersMonthlyLoyaltyLoadBar } from "./UsersMonthlyLoyaltyLoadBar.jsx";
import { UsersPodium } from "./UsersPodium.jsx";

import "./UsersPage.css";

/**
 * @param {{ onUserRowClick?: (userId: string) => void; isAdminViewer?: boolean }} props
 */
export function UsersPage({ onUserRowClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const hasSearchQuery = submittedSearch.trim().length >= USER_SEARCH_MIN_LENGTH;
  const isSearchInputTooShort = isUsersSearchInputTooShort(submittedSearch);

  const { phase, users, error } = useUsersSearchQuery({ search: submittedSearch });
  const isSearchPending = hasSearchQuery && phase === "loading";

  // Ввод не ищет сам по себе — запрос уходит по «Найти». Пустое поле не поиск,
  // а отмена: список возвращается к общему сразу.
  const handleSearchTermChange = (next) => {
    setSearchTerm(next);
    if (next.trim() === "") {
      setSubmittedSearch("");
    }
  };

  const handleSearchSubmit = () => {
    setSubmittedSearch(searchTerm);
  };

  return (
    <div className="users-page">
      <SearchInput
        value={searchTerm}
        onChange={handleSearchTermChange}
        onSubmit={handleSearchSubmit}
        placeholder={USER_SEARCH_INPUT_UI.PLACEHOLDER}
        ariaLabel={USER_SEARCH_INPUT_UI.ARIA_LABEL}
        clearAriaLabel={USER_SEARCH_INPUT_UI.CLEAR_ARIA}
        pendingAriaLabel={USER_SEARCH_INPUT_UI.PENDING_ARIA}
        isPending={isSearchPending}
      />
      <UsersPageBody
        phase={phase}
        users={users}
        error={error}
        hasActiveFilters={hasSearchQuery}
        isSearchInputTooShort={isSearchInputTooShort}
        onUserRowClick={onUserRowClick}
      />
    </div>
  );
}

/**
 * @param {{
 *   phase: 'loading' | 'success' | 'error';
 *   users: import('../../../entities/user/model/types.js').UserSearchListItem[];
 *   error: string;
 *   hasActiveFilters: boolean;
 *   isSearchInputTooShort?: boolean;
 *   onUserRowClick?: (userId: string) => void;
 * }} props
 */
function UsersPageBody({
  phase,
  users,
  error,
  hasActiveFilters,
  isSearchInputTooShort = false,
  onUserRowClick,
}) {
  const showPodium = !hasActiveFilters && !isSearchInputTooShort;
  const monthlyLoyaltyQuery = useUsersMonthlyLoyaltyPointsQuery({
    enabled: showPodium,
  });

  const podiumEntries = useMemo(
    () => (showPodium ? rankUsersForPodium(users) : []),
    [showPodium, users],
  );
  const listUsers = useMemo(
    () => excludeUsersPodiumFromList(users, podiumEntries),
    [users, podiumEntries],
  );

  if (phase === "loading") {
    return <p className="users-page__state">{USERS_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error") {
    return (
      <p className="users-page__state users-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (users.length === 0) {
    const emptyMessage = isSearchInputTooShort
      ? USERS_PAGE_UI.SEARCH_TOO_SHORT
      : hasActiveFilters
        ? USERS_PAGE_UI.EMPTY_BY_QUERY
        : USERS_PAGE_UI.EMPTY;
    return <p className="users-page__state">{emptyMessage}</p>;
  }

  const pointsAwarded = monthlyLoyaltyQuery.data?.pointsAwarded ?? 0;
  const goal = monthlyLoyaltyQuery.data?.goal ?? 0;
  const description = monthlyLoyaltyQuery.data?.description ?? "";

  return (
    <div className="users-page__body">
      {showPodium ? (
        <div className="users-page__list-header">
          {podiumEntries.length > 0 ? (
            <UsersPodium entries={podiumEntries} onUserPress={onUserRowClick} />
          ) : null}
          <UsersMonthlyLoyaltyLoadBar
            pointsAwarded={pointsAwarded}
            goal={goal}
            description={description}
            isLoading={
              monthlyLoyaltyQuery.isPending && monthlyLoyaltyQuery.data == null
            }
          />
        </div>
      ) : null}
      {listUsers.length > 0 ? (
        <div className="users-page__grid" role="list">
          {listUsers.map((user) => (
            <div key={user._id} className="users-page__cell" role="listitem">
              <UserListRow user={user} onRowClick={onUserRowClick} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
