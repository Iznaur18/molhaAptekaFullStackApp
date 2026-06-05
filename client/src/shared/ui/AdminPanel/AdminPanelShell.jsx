import { SearchInput } from "../SearchInput/SearchInput.jsx";
import { ADMIN_PANEL_UI } from "../../config/appUiCopy.js";

import "./AdminPanel.css";

/**
 * @param {{
 *   title: string;
 *   hint: string;
 *   count: number;
 *   filteredCount?: number;
 *   searchValue: string;
 *   onSearchChange: (value: string) => void;
 *   searchPlaceholder: string;
 *   onRefresh: () => void;
 *   isLoading: boolean;
 *   isRefreshing?: boolean;
 *   error?: string;
 *   isCreateOpen: boolean;
 *   onToggleCreate: () => void;
 *   createHeading: string;
 *   createPanel: import('react').ReactNode;
 *   children: import('react').ReactNode;
 * }} props
 */
export function AdminPanelShell({
  title,
  hint,
  count,
  filteredCount,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onRefresh,
  isLoading,
  isRefreshing = false,
  error = "",
  isCreateOpen,
  onToggleCreate,
  createHeading,
  createPanel,
  children,
}) {
  const countLabel =
    filteredCount != null && filteredCount !== count
      ? ADMIN_PANEL_UI.COUNT_FILTERED(filteredCount, count)
      : ADMIN_PANEL_UI.COUNT(count);

  return (
    <section className="admin-panel">
      <header className="admin-panel__header">
        <h2 className="admin-panel__title">{title}</h2>
        <p className="admin-panel__hint">{hint}</p>
      </header>

      <div className="admin-panel__toolbar">
        <span className="admin-panel__count">{countLabel}</span>
        <div className="admin-panel__toolbar-search">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            ariaLabel={searchPlaceholder}
            clearAriaLabel={ADMIN_PANEL_UI.SEARCH_CLEAR}
            pendingAriaLabel={ADMIN_PANEL_UI.SEARCH_PENDING}
            isPending={isRefreshing}
          />
        </div>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
        >
          {ADMIN_PANEL_UI.REFRESH}
        </button>
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={onToggleCreate}
        >
          {isCreateOpen ? ADMIN_PANEL_UI.HIDE_CREATE : ADMIN_PANEL_UI.SHOW_CREATE}
        </button>
      </div>

      {error ? (
        <p className="admin-panel__alert admin-panel__alert_error" role="alert">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="admin-panel__alert admin-panel__alert_info">
          {ADMIN_PANEL_UI.LOADING}
        </p>
      ) : null}

      <div className="admin-panel__create" hidden={!isCreateOpen}>
        <h3 className="admin-panel__create-head">{createHeading}</h3>
        <div className="admin-panel__create-body">{createPanel}</div>
      </div>

      {children}
    </section>
  );
}
