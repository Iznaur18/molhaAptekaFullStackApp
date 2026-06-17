import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useProductCategoryAdminMutations } from "../../../entities/product-category-tree/model/useProductCategoryAdminMutations.js";
import { productCategoryAdminQueryKeys } from "../../../entities/product-category-tree/model/productCategoryAdminQueryKeys.js";
import { useProductCategoriesAdminQuery } from "../../../entities/product-category-tree/model/useProductCategoriesAdminQuery.js";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  filterCategoryRows,
  findAnyLeafForReassign,
  formatCategoryLegacyDetachLabel,
  formatCategoryPath,
  isCategoryStructureChanged,
  isValidCategorySlug,
  parseKeywordsCsv,
  sortCategoryRows,
} from "../lib/categoryTreeAdminUtils.js";

export function useCategoryTreeAdminPage() {
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
        isLeaf: newParentId.trim() ? newIsLeaf : false,
        searchKeywords: newParentId.trim() ? parseKeywordsCsv(newKeywordsCsv) : [],
        legacyProductCategory: newParentId.trim() ? newLegacySlug.trim() || null : null,
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

  const removeCategoryRow = useCallback(
    (categoryId) => {
      updateRows((prev) => prev.filter((row) => row._id !== categoryId));
      if (editingId === categoryId) {
        cancelEdit();
      }
    },
    [cancelEdit, editingId, updateRows],
  );

  const handleDelete = async (row) => {
    const categoryId = row._id;
    if (!window.confirm(CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_CONFIRM)) {
      return;
    }

    const deleteCategory = async ({
      reassignProductCategoryId,
      detachProducts = false,
    } = {}) => {
      setPendingId(categoryId);
      setActionError("");
      await deleteMutation.mutateAsync({
        categoryId,
        reassignProductCategoryId,
        detachProducts,
      });
      removeCategoryRow(categoryId);
    };

    try {
      await deleteCategory();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR;
      const hasProducts = /привязаны товары/i.test(message);
      if (!hasProducts) {
        setActionError(message);
        return;
      }

      const reassignLeaf = findAnyLeafForReassign(row, rows);
      if (reassignLeaf) {
        const targetLabel = formatCategoryPath(reassignLeaf);
        const confirmed = window.confirm(
          CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_REASSIGN_CONFIRM.replace(
            "{message}",
            message,
          ).replace("{targetLabel}", targetLabel),
        );
        if (!confirmed) {
          setActionError(message);
          return;
        }

        try {
          await deleteCategory({
            reassignProductCategoryId: reassignLeaf._id,
          });
        } catch (retryError) {
          setActionError(
            retryError instanceof Error
              ? retryError.message
              : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR,
          );
        }
        return;
      }

      const legacyLabel = formatCategoryLegacyDetachLabel(row);
      const confirmedDetach = window.confirm(
        CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_DETACH_CONFIRM.replace(
          "{message}",
          message,
        ).replace("{legacyLabel}", legacyLabel),
      );
      if (!confirmedDetach) {
        setActionError(message);
        return;
      }

      try {
        await deleteCategory({ detachProducts: true });
      } catch (retryError) {
        setActionError(
          retryError instanceof Error
            ? retryError.message
            : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR,
        );
      }
    } finally {
      setPendingId(null);
    }
  };

  const displayError = actionError || (phase === "error" ? error : "");
  const isCreateRoot = !newParentId.trim();

  return {
    rows,
    phase,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    isCreateOpen,
    setIsCreateOpen,
    pendingId,
    editingId,
    editDraft,
    newSlug,
    setNewSlug,
    newLabelRu,
    setNewLabelRu,
    newParentId,
    setNewParentId,
    newIsLeaf,
    setNewIsLeaf,
    newKeywordsCsv,
    setNewKeywordsCsv,
    newLegacySlug,
    setNewLegacySlug,
    displayError,
    isCreateRoot,
    parentOptions,
    filteredRows,
    patchDraft,
    cancelEdit,
    startEdit,
    handleCreate,
    handleSaveEdit,
    handleDelete,
    reloadRows,
  };
}
