import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { excludeUsersPodiumFromList, rankUsersForPodium } from "@izibuy/shared-lib";
import {
  USER_SEARCH_MIN_LENGTH,
  isUsersSearchInputTooShort,
} from "@molha/api-contract";

import {
  forgetPendingPaymentId,
  readPendingPaymentId,
} from "../../../entities/payment/lib/pendingPaymentStorage.js";
import { useMyPaymentQuery } from "../../../entities/payment/model/paymentQueries.js";
import { useUsersMonthlyLoyaltyPointsQuery } from "../../../entities/user/model/useUsersMonthlyLoyaltyPointsQuery.js";
import { usersMonthlyLoyaltyQueryKeys } from "../../../entities/user/model/usersMonthlyLoyaltyQueryKeys.js";
import { useUsersSearchQuery } from "../../../entities/user/model/useUsersSearchQuery.js";
import { UserListRow } from "../../../entities/user/ui/UserListRow.jsx";
import {
  USER_SEARCH_INPUT_UI,
  USERS_MONTHLY_LOYALTY_LOADBAR_UI,
  USERS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { AUTH_LOGIN_PATH } from "../../../shared/lib/authPaths.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";
import { UsersMonthlyDonationModal } from "./UsersMonthlyDonationModal.jsx";
import { UsersMonthlyLoyaltyLoadBar } from "./UsersMonthlyLoyaltyLoadBar.jsx";
import { UsersPodium } from "./UsersPodium.jsx";

import "./UsersPage.css";

/** Приглашение войти: список пользователей сервер отдаёт только своим. */
function UsersPageAuthPrompt() {
  const navigate = useNavigate();

  return (
    <div className="users-page__auth">
      <p className="users-page__state">{USERS_PAGE_UI.LOGIN_HINT}</p>
      <button
        type="button"
        className="app-btn app-btn--primary users-page__login"
        onClick={() => navigate(AUTH_LOGIN_PATH)}
      >
        {USERS_PAGE_UI.LOGIN_BUTTON}
      </button>
    </div>
  );
}

/**
 * @param {{
 *   pointsAwarded: number;
 *   goal: number;
 *   description: string;
 *   isLoading: boolean;
 *   onDonateClick: () => void;
 *   feedbackMessage: string;
 * }} props
 */
function buildUsersMonthlyLoadBar(props) {
  return (
    <UsersMonthlyLoyaltyLoadBar
      pointsAwarded={props.pointsAwarded}
      goal={props.goal}
      description={props.description}
      isLoading={props.isLoading}
      onDonateClick={props.onDonateClick}
      feedbackMessage={props.feedbackMessage}
    />
  );
}

/**
 * @param {{
 *   onUserRowClick?: (userId: string) => void;
 *   isAdminViewer?: boolean;
 *   isAuthorized?: boolean;
 * }} props
 */
export function UsersPage({ onUserRowClick, isAuthorized = true }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [watchedPaymentId, setWatchedPaymentId] = useState("");
  const hasSearchQuery = submittedSearch.trim().length >= USER_SEARCH_MIN_LENGTH;
  const isSearchInputTooShort = isUsersSearchInputTooShort(submittedSearch);

  const { phase, users, error } = useUsersSearchQuery({
    search: submittedSearch,
    enabled: isAuthorized,
  });
  const isSearchPending = hasSearchQuery && phase === "loading";

  const monthlyLoyaltyQuery = useUsersMonthlyLoyaltyPointsQuery({ enabled: true });
  const paymentQuery = useMyPaymentQuery({ paymentId: watchedPaymentId || null });

  useEffect(() => {
    if (!isAuthorized) return;
    if (!new URLSearchParams(window.location.search).has("donated")) return;
    const pendingId = readPendingPaymentId();
    if (!pendingId) return;
    setWatchedPaymentId(pendingId);
    setFeedbackMessage(USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_PENDING);
  }, [isAuthorized]);

  useEffect(() => {
    const status = paymentQuery.data?.status;
    if (!status || status === "created") return;
    forgetPendingPaymentId();
    if (status === "succeeded") {
      setFeedbackMessage(USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_SUCCESS);
      void queryClient.invalidateQueries({
        queryKey: usersMonthlyLoyaltyQueryKeys.all,
      });
    } else {
      setFeedbackMessage("");
    }
    setWatchedPaymentId("");
    const url = new URL(window.location.href);
    if (url.searchParams.has("donated")) {
      url.searchParams.delete("donated");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [paymentQuery.data?.status, queryClient]);

  const handleDonateClick = () => {
    if (!isAuthorized) {
      navigate(AUTH_LOGIN_PATH);
      return;
    }
    setIsDonateModalOpen(true);
  };

  const handleSearchTermChange = (next) => {
    setSearchTerm(next);
    if (next.trim() === "") {
      setSubmittedSearch("");
    }
  };

  const handleSearchSubmit = () => {
    setSubmittedSearch(searchTerm);
  };

  const loadBar = buildUsersMonthlyLoadBar({
    pointsAwarded: monthlyLoyaltyQuery.data?.pointsAwarded ?? 0,
    goal: monthlyLoyaltyQuery.data?.goal ?? 0,
    description: monthlyLoyaltyQuery.data?.description ?? "",
    isLoading:
      monthlyLoyaltyQuery.isPending && monthlyLoyaltyQuery.data == null,
    onDonateClick: handleDonateClick,
    feedbackMessage,
  });

  if (!isAuthorized) {
    return (
      <div className="users-page">
        <div className="users-page__list-header">{loadBar}</div>
        <UsersPageAuthPrompt />
      </div>
    );
  }

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
        loadBar={loadBar}
      />
      <UsersMonthlyDonationModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
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
 *   loadBar: import('react').ReactNode;
 * }} props
 */
function UsersPageBody({
  phase,
  users,
  error,
  hasActiveFilters,
  isSearchInputTooShort = false,
  onUserRowClick,
  loadBar,
}) {
  const showPodium = !hasActiveFilters && !isSearchInputTooShort;

  const podiumEntries = useMemo(
    () => (showPodium ? rankUsersForPodium(users) : []),
    [showPodium, users],
  );
  const listUsers = useMemo(
    () => excludeUsersPodiumFromList(users, podiumEntries),
    [users, podiumEntries],
  );

  if (phase === "loading") {
    return (
      <div className="users-page__body">
        <div className="users-page__list-header">{loadBar}</div>
        <p className="users-page__state">{USERS_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (phase === "error") {
    if (isAuthSessionError(new Error(error))) {
      return <UsersPageAuthPrompt />;
    }
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
    return (
      <div className="users-page__body">
        {showPodium ? <div className="users-page__list-header">{loadBar}</div> : null}
        <p className="users-page__state">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="users-page__body">
      {showPodium ? (
        <div className="users-page__list-header">
          {podiumEntries.length > 0 ? (
            <UsersPodium entries={podiumEntries} onUserPress={onUserRowClick} />
          ) : null}
          {loadBar}
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
