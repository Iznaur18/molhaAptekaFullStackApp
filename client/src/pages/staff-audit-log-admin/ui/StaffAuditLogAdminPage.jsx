import { useMemo, useState } from "react";

import { useStaffAuditLogQuery } from "../../../entities/staff-audit-log/model/useStaffAuditLogQuery.js";
import { STAFF_AUDIT_LOG_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { StaffAuditLogRow } from "./StaffAuditLogRow.jsx";

import "./StaffAuditLogAdminPage.css";

const UI = STAFF_AUDIT_LOG_ADMIN_PAGE_UI;

export function StaffAuditLogAdminPage() {
  const [actionInput, setActionInput] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [filters, setFilters] = useState(/** @type {{ page: number; action?: string; from?: string; to?: string; actorUserId?: string }} */ ({ page: 1 }));

  const query = useStaffAuditLogQuery(filters);
  const data = query.data;

  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const page = data?.page ?? filters.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const items = data?.items ?? [];

  const isRefreshing = query.isFetching && !query.isPending;
  const errorMessage =
    query.isError && query.error instanceof Error ? query.error.message : "";

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.action || filters.from || filters.to || filters.actorUserId),
    [filters],
  );

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      page: 1,
      action: actionInput.trim() || undefined,
      from: fromInput || undefined,
      to: toInput || undefined,
    }));
  };

  const resetFilters = () => {
    setActionInput("");
    setFromInput("");
    setToInput("");
    setFilters({ page: 1 });
  };

  const filterByActor = (actorUserId) => {
    setFilters((prev) => ({ ...prev, page: 1, actorUserId }));
  };

  const clearActor = () => {
    setFilters((prev) => ({ ...prev, page: 1, actorUserId: undefined }));
  };

  const goToPage = (nextPage) => {
    setFilters((prev) => ({ ...prev, page: nextPage }));
  };

  return (
    <section className="staff-audit-page">
      <header className="staff-audit-page__header">
        <h2 className="staff-audit-page__title">{UI.TITLE}</h2>
        <p className="staff-audit-page__hint">{UI.HINT}</p>
      </header>

      <form className="staff-audit-page__filters" onSubmit={applyFilters}>
        <input
          type="text"
          className="staff-audit-page__input"
          value={actionInput}
          onChange={(event) => setActionInput(event.target.value)}
          placeholder={UI.FILTER_ACTION_PLACEHOLDER}
          aria-label={UI.FILTER_ACTION_PLACEHOLDER}
        />
        <label className="staff-audit-page__date">
          <span>{UI.FILTER_FROM}</span>
          <input
            type="date"
            value={fromInput}
            onChange={(event) => setFromInput(event.target.value)}
          />
        </label>
        <label className="staff-audit-page__date">
          <span>{UI.FILTER_TO}</span>
          <input
            type="date"
            value={toInput}
            onChange={(event) => setToInput(event.target.value)}
          />
        </label>
        <button type="submit" className="app-btn app-btn--primary">
          {UI.APPLY}
        </button>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={resetFilters}
          disabled={!hasActiveFilters && !actionInput && !fromInput && !toInput}
        >
          {UI.RESET}
        </button>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={() => void query.refetch()}
          disabled={query.isPending || isRefreshing}
        >
          {UI.REFRESH}
        </button>
      </form>

      <div className="staff-audit-page__toolbar">
        <span className="staff-audit-page__count">{UI.COUNT(total)}</span>
        {filters.actorUserId ? (
          <button
            type="button"
            className="staff-audit-page__actor-clear"
            onClick={clearActor}
          >
            {UI.CLEAR_ACTOR}
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="staff-audit-page__alert staff-audit-page__alert--error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {query.isPending ? (
        <p className="staff-audit-page__alert">{UI.LOADING}</p>
      ) : null}

      {!query.isPending && !errorMessage && items.length === 0 ? (
        <p className="staff-audit-page__alert">
          {hasActiveFilters ? UI.EMPTY_FILTER : UI.EMPTY}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="staff-audit-page__list">
          {items.map((entry) => (
            <StaffAuditLogRow
              key={entry._id}
              entry={entry}
              onFilterActor={filterByActor}
            />
          ))}
        </ul>
      ) : null}

      {pages > 1 ? (
        <div className="staff-audit-page__pagination">
          <button
            type="button"
            className="app-btn app-btn--secondary"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isRefreshing}
          >
            {UI.PREV}
          </button>
          <span className="staff-audit-page__page-label">
            {UI.PAGE_LABEL(page, pages)}
          </span>
          <button
            type="button"
            className="app-btn app-btn--secondary"
            onClick={() => goToPage(page + 1)}
            disabled={page >= pages || isRefreshing}
          >
            {UI.NEXT}
          </button>
        </div>
      ) : null}
    </section>
  );
}
