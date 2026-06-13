import { useState } from "react";

import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";

import { useUsersSearchQuery } from "../../../entities/user/model/useUsersSearchQuery.js";
import { UserListRow } from "../../../entities/user/ui/UserListRow.jsx";
import {
  USER_SEARCH_INPUT_UI,
  USER_SEARCH_UI,
  USERS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

import "./UsersPage.css";

/**
 * @param {{ onUserRowClick?: (userId: string) => void; isAdminViewer?: boolean }} props
 */
export function UsersPage({ onUserRowClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, USER_SEARCH_UI.DEBOUNCE_MS);
  const isSearchPending = searchTerm !== debouncedSearch;
  const hasSearchQuery = debouncedSearch.trim().length >= USER_SEARCH_MIN_LENGTH;
  const hasActiveFilters = hasSearchQuery;

  const { phase, users, error } = useUsersSearchQuery({ search: debouncedSearch });

  return (
    <div className="users-page">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
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
        hasActiveFilters={hasActiveFilters}
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
 *   onUserRowClick?: (userId: string) => void;
 * }} props
 */
function UsersPageBody({ phase, users, error, hasActiveFilters, onUserRowClick }) {
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
    return (
      <p className="users-page__state">
        {hasActiveFilters ? USERS_PAGE_UI.EMPTY_BY_QUERY : USERS_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <div className="users-page__grid" role="list">
      {users.map((user) => (
        <div key={user._id} className="users-page__cell" role="listitem">
          <UserListRow user={user} onRowClick={onUserRowClick} />
        </div>
      ))}
    </div>
  );
}
