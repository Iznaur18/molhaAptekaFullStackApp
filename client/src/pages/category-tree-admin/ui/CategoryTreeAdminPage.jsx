import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useProductCategoryAdminMutations } from "../../../entities/product-category-tree/model/useProductCategoryAdminMutations.js";
import { productCategoryAdminQueryKeys } from "../../../entities/product-category-tree/model/productCategoryAdminQueryKeys.js";
import { useProductCategoriesAdminQuery } from "../../../entities/product-category-tree/model/useProductCategoriesAdminQuery.js";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { AdminPanelShell } from "../../../shared/ui/AdminPanel/AdminPanelShell.jsx";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  filterCategoryRows,
  formatCategoryPath,
  isCategoryStructureChanged,
  isValidCategorySlug,
  parseKeywordsCsv,
  sortCategoryRows,
} from "../lib/categoryTreeAdminUtils.js";
import { CategoryTreeAdminCard } from "./CategoryTreeAdminCard.jsx";

export function CategoryTreeAdminPage() {
  const queryClient = useQueryClient();
  const { createMutation, patchMutation, deleteMutation } =
    useProductCategoryAdminMutations();
  const categoriesQuery = useProductCategoriesAdminQuery();
  const rows = useMemo(
    () => sortCategoryRows(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const phase = categoriesQuery.isPending
    ? "loading"
    : categoriesQuery.isError
      ? "error"
      : "success";
  const isRefreshing = categoriesQuery.isFetching && !categoriesQuery.isPending;
  const error =
    categoriesQuery.error instanceof Error
      ? categoriesQuery.error.message
      : CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR;

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(
    /** @type {Record<string, string | boolean>} */ ({}),
  );
  const [newSlug, setNewSlug] = useState("");
  const [newLabelRu, setNewLabelRu] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [newIsLeaf, setNewIsLeaf] = useState(false);
  const [newKeywordsCsv, setNewKeywordsCsv] = useState("");
  const [newLegacySlug, setNewLegacySlug] = useState("");
  const [actionError, setActionError] = useState("");

  const updateRows = useCallback(
    (
      /** @type {(rows: import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]) => import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]} */ updater,
    ) => {
      queryClient.setQueryData(productCategoryAdminQueryKeys.all, (old) => {
        const next = updater(old ?? []);
        return sortCategoryRows(next);
      });
    },
    [queryClient],
  );

  const reloadRows = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        return categoriesQuery.refetch();
      }
      setActionError("");
      try {
        await categoriesQuery.refetch();
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR,
        );
      }
      return undefined;
    },
    [categoriesQuery],
  );

  const parentOptions = useMemo(
    () =>
      rows
        .filter((row) => row.isLeaf !== true)
        .map((row) => ({
          id: row._id,
          label: formatCategoryPath(row),
        })),
    [rows],
  );

  const filteredRows = useMemo(
    () => filterCategoryRows(rows, searchQuery),
    [rows, searchQuery],
  );

  const patchDraft = useCallback((patch) => {
    setEditDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft({});
  }, []);

  const startEdit = useCallback((row) => {
    setEditingId(row._id);
    setEditDraft({
      slug: row.slug,
      labelRu: row.labelRu,
      parentId: row.parentId ?? "",
      isLeaf: row.isLeaf,
      keywordsCsv: (row.searchKeywords ?? []).join(", "),
      legacyProductCategory: row.legacyProductCategory ?? "",
    });
    setActionError("");
  }, []);

  const resetCreateForm = () => {
    setNewSlug("");
    setNewLabelRu("");
    setNewParentId("");
    setNewIsLeaf(false);
    setNewKeywordsCsv("");
    setNewLegacySlug("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const slug = newSlug.trim().toLowerCase();
    if (!isValidCategorySlug(slug)) {
      setActionError(CATEGORY_TREE_ADMIN_PAGE_UI.SLUG_INVALID);
      return;
    }
    try {
      setPendingId("create");
      setActionError("");
      const created = await createMutation.mutateAsync({
        slug,
        labelRu: newLabelRu.trim(),
        parentId: newParentId.trim() || null,
        isLeaf: newIsLeaf,
        searchKeywords: parseKeywordsCsv(newKeywordsCsv),
        legacyProductCategory: newLegacySlug.trim() || null,
      });
      updateRows((prev) => [...prev, created]);
      resetCreateForm();
      setIsCreateOpen(false);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (row) => {
    const categoryId = row._id;
    try {
      setPendingId(categoryId);
      setActionError("");
      const updated = await patchMutation.mutateAsync({
        categoryId,
        body: {
        slug: String(editDraft.slug ?? "").trim(),
        labelRu: String(editDraft.labelRu ?? "").trim(),
        parentId: String(editDraft.parentId ?? "").trim() || null,
        isLeaf: editDraft.isLeaf === true,
        searchKeywords: parseKeywordsCsv(String(editDraft.keywordsCsv ?? "")),
        legacyProductCategory:
          String(editDraft.legacyProductCategory ?? "").trim() || null,
        },
      });

      if (isCategoryStructureChanged(row, editDraft)) {
        await reloadRows({ silent: true });
      } else {
        updateRows((prev) =>
          prev.map((item) => (item._id === categoryId ? updated : item)),
        );
      }
      cancelEdit();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm(CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_CONFIRM)) {
      return;
    }
    try {
      setPendingId(categoryId);
      setActionError("");
      await deleteMutation.mutateAsync(categoryId);
      updateRows((prev) => prev.filter((row) => row._id !== categoryId));
      if (editingId === categoryId) {
        cancelEdit();
      }
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const displayError = actionError || (phase === "error" ? error : "");

  const createPanel = (
    <form className="admin-panel__create-form" onSubmit={handleCreate}>
      <div className="admin-panel__form-grid">
        <label className="admin-panel__field admin-panel__field_full">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_SLUG}</span>
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="electronics-headphones"
            required
          />
          <small className="admin-panel__field-hint">
            {CATEGORY_TREE_ADMIN_PAGE_UI.SLUG_HINT}
          </small>
        </label>
        <label className="admin-panel__field">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_NAME}</span>
          <input
            value={newLabelRu}
            onChange={(e) => setNewLabelRu(e.target.value)}
            required
          />
        </label>
        <label className="admin-panel__field">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_PARENT}</span>
          <select value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
            <option value="">{CATEGORY_TREE_ADMIN_PAGE_UI.PARENT_ROOT}</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-panel__field admin-panel__field_row">
          <input
            type="checkbox"
            checked={newIsLeaf}
            onChange={(e) => setNewIsLeaf(e.target.checked)}
          />
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</span>
        </label>
        <label className="admin-panel__field admin-panel__field_full">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_KEYWORDS}</span>
          <input
            value={newKeywordsCsv}
            onChange={(e) => setNewKeywordsCsv(e.target.value)}
            placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.KEYWORDS_PLACEHOLDER}
          />
        </label>
        <label className="admin-panel__field">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEGACY}</span>
          <select
            value={newLegacySlug}
            onChange={(e) => setNewLegacySlug(e.target.value)}
          >
            <option value="">{CATEGORY_TREE_ADMIN_PAGE_UI.LEGACY_NONE}</option>
            {PRODUCT_CATEGORIES.map((slug) => (
              <option key={slug} value={slug}>
                {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="admin-panel__create-actions">
        <button
          type="submit"
          className="app-btn app-btn--primary"
          disabled={pendingId === "create"}
        >
          {CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_BUTTON}
        </button>
      </div>
    </form>
  );

  const listContent = (() => {
    if (phase === "success" && rows.length === 0) {
      return (
        <p className="admin-panel__alert admin-panel__alert_info">
          {CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY}
        </p>
      );
    }
    if (phase === "success" && filteredRows.length === 0) {
      return (
        <p className="admin-panel__alert admin-panel__alert_info">
          {CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY_FILTER}
        </p>
      );
    }
    if (filteredRows.length === 0) {
      return null;
    }
    return (
      <ul className="admin-panel__list">
        {filteredRows.map((row) => (
          <CategoryTreeAdminCard
            key={row._id}
            row={row}
            parentOptions={parentOptions}
            isEditing={editingId === row._id}
            isPending={pendingId === row._id}
            editDraft={editDraft}
            onDraftChange={patchDraft}
            onStartEdit={() => startEdit(row)}
            onCancelEdit={cancelEdit}
            onSave={() => void handleSaveEdit(row)}
            onDelete={() => void handleDelete(row._id)}
          />
        ))}
      </ul>
    );
  })();

  return (
    <AdminPanelShell
      title={CATEGORY_TREE_ADMIN_PAGE_UI.TITLE}
      hint={CATEGORY_TREE_ADMIN_PAGE_UI.HINT}
      count={rows.length}
      filteredCount={searchQuery.trim() ? filteredRows.length : undefined}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={CATEGORY_TREE_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
      onRefresh={() => void reloadRows({ silent: true })}
      isLoading={phase === "loading"}
      isRefreshing={isRefreshing}
      error={displayError}
      isCreateOpen={isCreateOpen}
      onToggleCreate={() => setIsCreateOpen((open) => !open)}
      createHeading={CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_HEADING}
      createPanel={createPanel}
    >
      {listContent}
    </AdminPanelShell>
  );
}
