import { useEffect, useState } from "react";

import { fetchUsersSearchPage } from "../../../entities/user/api/fetchUsersSearch.js";
import { UserListRow } from "../../../entities/user/ui/UserListRow.jsx";
import {
  API_CLIENT_UI,
  USER_SEARCH_INPUT_UI,
  USER_SEARCH_UI,
  USERS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

import "./UsersPage.css";

const SORT_NAME = "name";
const SORT_RATING = "rating";
const MIN_RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * @param {{ onUserRowClick?: (userId: string) => void }} props
 */
export function UsersPage({ onUserRowClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState(SORT_NAME);
  const [minRating, setMinRating] = useState("");
  const [users, setUsers] = useState(
    /** @type {import('../../../entities/user/model/types.js').UserSearchListItem[]} */ ([]),
  );
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");

  const debouncedSearch = useDebouncedValue(searchTerm, USER_SEARCH_UI.DEBOUNCE_MS);
  const isSearchPending = searchTerm !== debouncedSearch;
  const hasSearchQuery = debouncedSearch.trim() !== "";
  const minRatingNum = minRating === "" ? null : Number(minRating);
  const hasActiveFilters =
    hasSearchQuery || sort !== SORT_NAME || minRatingNum != null;

  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      setPhase("loading");
      try {
        const { users: list } = await fetchUsersSearchPage({
          search: debouncedSearch.trim(),
          sort,
          ...(minRatingNum != null ? { minRating: minRatingNum } : {}),
        });
        if (isCancelled) return;
        setUsers(list);
        setPhase("success");
      } catch (e) {
        if (isCancelled) return;
        setError(
          e instanceof Error ? e.message : API_CLIENT_UI.FETCH_USERS_SEARCH_FALLBACK,
        );
        setPhase("error");
      }
    };

    void loadUsers();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, sort, minRatingNum]);

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
      <div className="users-page__filters">
        <label className="users-page__filter-label">
          <span>{USERS_PAGE_UI.SORT_LABEL}</span>
          <select
            className="users-page__filter-control"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value={SORT_NAME}>{USERS_PAGE_UI.SORT_NAME}</option>
            <option value={SORT_RATING}>{USERS_PAGE_UI.SORT_RATING}</option>
          </select>
        </label>
        <label className="users-page__filter-label">
          <span>{USERS_PAGE_UI.MIN_RATING_LABEL}</span>
          <select
            className="users-page__filter-control"
            value={minRating}
            onChange={(event) => setMinRating(event.target.value)}
          >
            <option value="">{USERS_PAGE_UI.MIN_RATING_ANY}</option>
            {MIN_RATING_OPTIONS.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
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
        {hasActiveFilters ? USERS_PAGE_UI.EMPTY_BY_FILTERS : USERS_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <ul className="users-page__list" role="list">
      {users.map((user) => (
        <li key={user._id} className="users-page__item" role="listitem">
          <UserListRow user={user} onRowClick={onUserRowClick} />
        </li>
      ))}
    </ul>
  );
}
