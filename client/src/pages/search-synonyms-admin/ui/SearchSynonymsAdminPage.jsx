import { useCallback, useEffect, useMemo, useState } from "react";

import { createProductSearchSynonymAdmin } from "../../../entities/product-search-synonym/api/createProductSearchSynonymAdmin.js";
import { deleteProductSearchSynonymAdmin } from "../../../entities/product-search-synonym/api/deleteProductSearchSynonymAdmin.js";
import { fetchProductSearchSynonymsAdmin } from "../../../entities/product-search-synonym/api/fetchProductSearchSynonymsAdmin.js";
import { patchProductSearchSynonymAdmin } from "../../../entities/product-search-synonym/api/patchProductSearchSynonymAdmin.js";
import { AdminPanelShell } from "../../../shared/ui/AdminPanel/AdminPanelShell.jsx";
import { SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { filterSynonymRows, sortSynonymRows } from "../lib/searchSynonymsAdminUtils.js";
import { SearchSynonymAdminCard } from "./SearchSynonymAdminCard.jsx";
import { SynonymCategoryPicker } from "./SynonymCategoryPicker.jsx";

export function SearchSynonymsAdminPage() {
  const [phase, setPhase] = useState("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rows, setRows] = useState(
    /** @type {import('../../../entities/product-search-synonym/model/types.js').ProductSearchSynonymRow[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editToken, setEditToken] = useState("");
  const [editCategories, setEditCategories] = useState(/** @type {string[]} */ ([]));
  const [newToken, setNewToken] = useState("");
  const [newCategories, setNewCategories] = useState(/** @type {string[]} */ ([]));

  const loadRows = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setPhase("loading");
    }
    setError("");
    try {
      const list = await fetchProductSearchSynonymsAdmin();
      setRows(sortSynonymRows(list));
      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR,
      );
      setPhase("error");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(
    () => filterSynonymRows(rows, searchQuery),
    [rows, searchQuery],
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditToken("");
    setEditCategories([]);
  }, []);

  const startEdit = useCallback((row) => {
    setEditingId(row._id);
    setEditToken(row.token);
    setEditCategories(row.categories);
    setError("");
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (newCategories.length === 0) {
      setError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    try {
      setPendingId("create");
      setError("");
      const created = await createProductSearchSynonymAdmin({
        token: newToken.trim(),
        categories: newCategories,
      });
      setRows((prev) => sortSynonymRows([...prev, created]));
      setNewToken("");
      setNewCategories([]);
      setIsCreateOpen(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (synonymId) => {
    if (editCategories.length === 0) {
      setError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    try {
      setPendingId(synonymId);
      setError("");
      const updated = await patchProductSearchSynonymAdmin(synonymId, {
        token: editToken.trim(),
        categories: editCategories,
      });
      setRows((prev) =>
        sortSynonymRows(prev.map((row) => (row._id === synonymId ? updated : row))),
      );
      cancelEdit();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (synonymId) => {
    if (!window.confirm(SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_CONFIRM)) {
      return;
    }
    try {
      setPendingId(synonymId);
      setError("");
      await deleteProductSearchSynonymAdmin(synonymId);
      setRows((prev) => prev.filter((row) => row._id !== synonymId));
      if (editingId === synonymId) {
        cancelEdit();
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const createPanel = (
    <form className="admin-panel__create-form" onSubmit={handleCreate}>
      <label className="admin-panel__field">
        <span>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_TOKEN}</span>
        <input
          value={newToken}
          onChange={(e) => setNewToken(e.target.value)}
          required
          minLength={3}
        />
      </label>
      <div className="admin-panel__field">
        <span>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.CATEGORIES_HINT}</span>
        <SynonymCategoryPicker
          selected={newCategories}
          onChange={setNewCategories}
          disabled={pendingId === "create"}
        />
      </div>
      <div className="admin-panel__create-actions">
        <button
          type="submit"
          className="app-btn app-btn--primary"
          disabled={pendingId === "create" || newCategories.length === 0}
        >
          {SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_BUTTON}
        </button>
      </div>
    </form>
  );

  const listContent = (() => {
    if (phase === "success" && rows.length === 0) {
      return (
        <p className="admin-panel__alert admin-panel__alert_info">
          {SEARCH_SYNONYMS_ADMIN_PAGE_UI.EMPTY}
        </p>
      );
    }
    if (phase === "success" && filteredRows.length === 0) {
      return (
        <p className="admin-panel__alert admin-panel__alert_info">
          {SEARCH_SYNONYMS_ADMIN_PAGE_UI.EMPTY_FILTER}
        </p>
      );
    }
    if (filteredRows.length === 0) {
      return null;
    }
    return (
      <ul className="admin-panel__list">
        {filteredRows.map((row) => (
          <SearchSynonymAdminCard
            key={row._id}
            row={row}
            isEditing={editingId === row._id}
            isPending={pendingId === row._id}
            editToken={editToken}
            editCategories={editCategories}
            onEditTokenChange={setEditToken}
            onEditCategoriesChange={setEditCategories}
            onStartEdit={() => startEdit(row)}
            onCancelEdit={cancelEdit}
            onSave={() => void handleSaveEdit(row._id)}
            onDelete={() => void handleDelete(row._id)}
          />
        ))}
      </ul>
    );
  })();

  return (
    <AdminPanelShell
      title={SEARCH_SYNONYMS_ADMIN_PAGE_UI.TITLE}
      hint={SEARCH_SYNONYMS_ADMIN_PAGE_UI.HINT}
      count={rows.length}
      filteredCount={searchQuery.trim() ? filteredRows.length : undefined}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={SEARCH_SYNONYMS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
      onRefresh={() => void loadRows({ silent: true })}
      isLoading={phase === "loading"}
      isRefreshing={isRefreshing}
      error={error}
      isCreateOpen={isCreateOpen}
      onToggleCreate={() => setIsCreateOpen((open) => !open)}
      createHeading={SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_HEADING}
      createPanel={createPanel}
    >
      {listContent}
    </AdminPanelShell>
  );
}
