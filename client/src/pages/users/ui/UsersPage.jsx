import { useEffect, useState } from "react";

import { fetchAllUsersForPublicList } from "../../../entities/user/api/fetchUsersSearch.js";
import { UserListRow } from "../../../entities/user/ui/UserListRow.jsx";
import {
  API_CLIENT_UI,
  USERS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./UsersPage.css";

/**
 * @param {{ onUserRowClick?: (userId: string) => void }} props
 */
export function UsersPage({ onUserRowClick }) {
  const [phase, setPhase] = useState("loading");
  const [users, setUsers] = useState(
    /** @type {import('../../../entities/user/model/types.js').UserSearchListItem[]} */ ([]),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await fetchAllUsersForPublicList();
        if (cancelled) return;
        setUsers(list);
        setPhase("success");
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_USERS_PAGE_FALLBACK,
        );
        setPhase("error");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
    return <p className="users-page__state">{USERS_PAGE_UI.EMPTY}</p>;
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
