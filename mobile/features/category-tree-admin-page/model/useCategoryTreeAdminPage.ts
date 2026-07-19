import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import type { ProductCategoryAdminRow } from "@/entities/product-category-tree/model/adminTypes";
import { useProductCategoriesAdminQuery } from "@/entities/product-category-tree/model/useProductCategoriesAdminQuery";
import { useProductCategoryAdminMutations } from "@/entities/product-category-tree/model/useProductCategoryAdminMutations";
import {
  collectCategorySubtreeIdsFromRows,
  filterCategoryRows,
  formatCategoryPath,
  isCategoryStructureChanged,
  isValidCategorySlug,
  parseKeywordsCsv,
  sortCategoryRows,
} from "@/features/category-tree-admin-page/lib/categoryTreeAdminUtils";
import { categoryAdminQueryKeys, categoryDisplayQueryKeys, categoryTreeQueryKeys } from "@/shared/api";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "@/shared/config";

type EditDraft = Record<string, string | boolean>;

export const useCategoryTreeAdminPage = () => {
  const queryClient = useQueryClient();
  const categoriesQuery = useProductCategoriesAdminQuery();
  const { createMutation, patchMutation, deleteMutation } = useProductCategoryAdminMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({});
  const [newSlug, setNewSlug] = useState("");
  const [newLabelRu, setNewLabelRu] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [newIsLeaf, setNewIsLeaf] = useState(false);
  const [newKeywordsCsv, setNewKeywordsCsv] = useState("");
  const [newLegacySlug, setNewLegacySlug] = useState("");
  const [actionError, setActionError] = useState("");

  const rows = useMemo(
    () => sortCategoryRows(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const phase = categoriesQuery.isPending
    ? "loading"
    : categoriesQuery.isError
      ? "error"
      : "success";
  const isRefreshing = categoriesQuery.isRefetching;
  const queryError =
    categoriesQuery.error instanceof Error
      ? categoriesQuery.error.message
      : CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR;

  const updateRows = useCallback(
    (updater: (prev: ProductCategoryAdminRow[]) => ProductCategoryAdminRow[]) => {
      queryClient.setQueryData(categoryAdminQueryKeys.all, (old: ProductCategoryAdminRow[] | undefined) => {
        const next = updater(old ?? []);
        return sortCategoryRows(next);
      });
    },
    [queryClient],
  );

  const refetchCategories = categoriesQuery.refetch;

  const reloadRows = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        return refetchCategories();
      }
      setActionError("");
      try {
        await refetchCategories();
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR,
        );
      }
      return undefined;
    },
    [refetchCategories],
  );

  const parentOptions = useMemo(
    () =>
      rows
        .filter((row) => row.isLeaf !== true)
        .map((row) => ({ id: row._id, label: formatCategoryPath(row) })),
    [rows],
  );

  const filteredRows = useMemo(
    () => filterCategoryRows(rows, searchQuery),
    [rows, searchQuery],
  );

  const patchDraft = useCallback((patch: EditDraft) => {
    setEditDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft({});
  }, []);

  const startEdit = useCallback((row: ProductCategoryAdminRow) => {
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

  const resetCreateForm = useCallback(() => {
    setNewSlug("");
    setNewLabelRu("");
    setNewParentId("");
    setNewIsLeaf(false);
    setNewKeywordsCsv("");
    setNewLegacySlug("");
  }, []);

  const handleCreate = async () => {
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
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (row: ProductCategoryAdminRow) => {
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
          legacyProductCategory: String(editDraft.legacyProductCategory ?? "").trim() || null,
        },
      });

      if (isCategoryStructureChanged(row, editDraft)) {
        await reloadRows({ silent: true });
      } else {
        updateRows((prev) => prev.map((item) => (item._id === categoryId ? updated : item)));
      }
      cancelEdit();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const removeCategorySubtree = useCallback(
    (categoryId: string, allRows: ProductCategoryAdminRow[]) => {
      const subtreeIds = collectCategorySubtreeIdsFromRows(categoryId, allRows);
      updateRows((prev) => prev.filter((row) => !subtreeIds.has(row._id)));
      if (editingId && subtreeIds.has(editingId)) {
        cancelEdit();
      }
    },
    [cancelEdit, editingId, updateRows],
  );

  const invalidateCatalogCategorySurfaces = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...categoryTreeQueryKeys.all, "roots"] });
    void queryClient.invalidateQueries({ queryKey: categoryTreeQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: categoryDisplayQueryKeys.all });
  }, [queryClient]);

  const runDelete = useCallback(
    async (row: ProductCategoryAdminRow) => {
      setPendingId(row._id);
      setActionError("");
      try {
        await deleteMutation.mutateAsync({ categoryId: row._id });
        removeCategorySubtree(row._id, rows);
        invalidateCatalogCategorySurfaces();
      } finally {
        setPendingId(null);
      }
    },
    [deleteMutation, invalidateCatalogCategorySurfaces, removeCategorySubtree, rows],
  );

  const displayError = actionError || (phase === "error" ? queryError : "");
  const isCreateRoot = !newParentId.trim();

  return {
    rows,
    phase,
    isRefreshing,
    queryError,
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
    runDelete,
    reloadRows,
    refetchCategories,
    setActionError,
  };
};
