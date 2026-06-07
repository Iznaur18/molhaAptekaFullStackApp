import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useProductSearchSynonymAdminMutations } from "../../../entities/product-search-synonym/model/useProductSearchSynonymAdminMutations.js";
import { searchSynonymAdminQueryKeys } from "../../../entities/product-search-synonym/model/searchSynonymAdminQueryKeys.js";
import { useProductSearchSynonymsAdminQuery } from "../../../entities/product-search-synonym/model/useProductSearchSynonymsAdminQuery.js";
import { AdminPanelShell } from "../../../shared/ui/AdminPanel/AdminPanelShell.jsx";
import { SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { filterSynonymRows, sortSynonymRows } from "../lib/searchSynonymsAdminUtils.js";
import { SearchSynonymAdminCard } from "./SearchSynonymAdminCard.jsx";
import { SynonymCategoryPicker } from "./SynonymCategoryPicker.jsx";

export function SearchSynonymsAdminPage() {
  const queryClient = useQueryClient();
  const { createMutation, patchMutation, deleteMutation } =
    useProductSearchSynonymAdminMutations();
  const synonymsQuery = useProductSearchSynonymsAdminQuery();
  const rows = useMemo(
    () => sortSynonymRows(synonymsQuery.data ?? []),
    [synonymsQuery.data],
  );
  const phase = synonymsQuery.isPending
    ? "loading"
    : synonymsQuery.isError
      ? "error"
      : "success";
  const isRefreshing = synonymsQuery.isFetching && !synonymsQuery.isPending;
  const error =
    synonymsQuery.error instanceof Error
      ? synonymsQuery.error.message
      : SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR;

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editToken, setEditToken] = useState("");
  const [editCategories, setEditCategories] = useState(/** @type {string[]} */ ([]));
  const [newToken, setNewToken] = useState("");
  const [newCategories, setNewCategories] = useState(/** @type {string[]} */ ([]));
  const [actionError, setActionError] = useState("");

  const updateRows = useCallback(
    (
      /** @type {(rows: import('../../../entities/product-search-synonym/model/types.js').ProductSearchSynonymRow[]) => import('../../../entities/product-search-synonym/model/types.js').ProductSearchSynonymRow[]} */ updater,
    ) => {
      queryClient.setQueryData(searchSynonymAdminQueryKeys.all, (old) => {
        const next = updater(old ?? []);
        return sortSynonymRows(next);
      });
    },
    [queryClient],
  );

  const reloadRows = useCallback(async () => {
    setActionError("");
    try {
      await synonymsQuery.refetch();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [synonymsQuery]);

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
    setActionError("");
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (newCategories.length === 0) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    try {
      setPendingId("create");
      setActionError("");
      const created = await createMutation.mutateAsync({
        token: newToken.trim(),
        categories: newCategories,
      });
      updateRows((prev) => [...prev, created]);
      setNewToken("");
      setNewCategories([]);
      setIsCreateOpen(false);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (synonymId) => {
    if (editCategories.length === 0) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    try {
      setPendingId(synonymId);
      setActionError("");
      const updated = await patchMutation.mutateAsync({
        synonymId,
        body: {
          token: editToken.trim(),
          categories: editCategories,
        },
      });
      updateRows((prev) =>
        prev.map((row) => (row._id === synonymId ? updated : row)),
      );
      cancelEdit();
    } catch (e) {
      setActionError(
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
      setActionError("");
      await deleteMutation.mutateAsync(synonymId);
      updateRows((prev) => prev.filter((row) => row._id !== synonymId));
      if (editingId === synonymId) {
        cancelEdit();
      }
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const displayError = actionError || (phase === "error" ? error : "");

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
      onRefresh={() => void reloadRows()}
      isLoading={phase === "loading"}
      isRefreshing={isRefreshing}
      error={displayError}
      isCreateOpen={isCreateOpen}
      onToggleCreate={() => setIsCreateOpen((open) => !open)}
      createHeading={SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_HEADING}
      createPanel={createPanel}
    >
      {listContent}
    </AdminPanelShell>
  );
}
