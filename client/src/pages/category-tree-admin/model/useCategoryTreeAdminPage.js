import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useProductCategoryAdminMutations } from "../../../entities/product-category-tree/model/useProductCategoryAdminMutations.js";
import { productCategoryAdminQueryKeys } from "../../../entities/product-category-tree/model/productCategoryAdminQueryKeys.js";
import { useProductCategoriesAdminQuery } from "../../../entities/product-category-tree/model/useProductCategoriesAdminQuery.js";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  filterCategoryRows,
  formatCategoryPath,
  collectCategorySubtreeIdsFromRows,
  isCategoryStructureChanged,
  isValidCategorySlug,
  parseKeywordsCsv,
  parseCharacteristicKeysLines,
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
  const [newCharacteristicKeysText, setNewCharacteristicKeysText] = useState("");
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
      characteristicKeysText: (row.defaultCharacteristicKeys ?? []).join("\n"),
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
    setNewCharacteristicKeysText("");
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
        defaultCharacteristicKeys:
          newParentId.trim() && newIsLeaf
            ? parseCharacteristicKeysLines(newCharacteristicKeysText)
            : [],
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
          defaultCharacteristicKeys:
            editDraft.isLeaf === true
              ? parseCharacteristicKeysLines(String(editDraft.characteristicKeysText ?? ""))
              : [],
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

  const removeCategorySubtree = useCallback(
    (categoryId, allRows) => {
      const subtreeIds = collectCategorySubtreeIdsFromRows(categoryId, allRows);
      updateRows((prev) => prev.filter((row) => !subtreeIds.has(row._id)));
      if (editingId && subtreeIds.has(editingId)) {
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

    try {
      setPendingId(categoryId);
      setActionError("");
      await deleteMutation.mutateAsync({ categoryId });
      removeCategorySubtree(categoryId, rows);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR,
      );
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
    newCharacteristicKeysText,
    setNewCharacteristicKeysText,
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
