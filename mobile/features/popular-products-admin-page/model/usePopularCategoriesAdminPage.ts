import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import type {
  CuratedCategoryKind,
  CuratedCategoryListAdminRow,
} from "@/entities/curated-category-list/api/curatedCategoryListAdminApi";
import { invalidateCuratedCategoryLists } from "@/entities/curated-category-list/lib/invalidateCuratedCategoryLists";
import { curatedCategoryListQueryKeys } from "@/entities/curated-category-list/model/curatedCategoryListQueryKeys";
import { useCuratedCategoryListAdminMutations } from "@/entities/curated-category-list/model/useCuratedCategoryListAdminMutations";
import { useCuratedCategoryListsAdminQuery } from "@/entities/curated-category-list/model/useCuratedCategoryListsAdminQuery";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "@/shared/config";

export const usePopularCategoriesAdminPage = () => {
  const queryClient = useQueryClient();
  const listsQuery = useCuratedCategoryListsAdminQuery();
  const {
    createMutation,
    patchMutation,
    deleteMutation,
    reorderMutation,
    addItemMutation,
    removeItemMutation,
  } = useCuratedCategoryListAdminMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRegionCode, setNewRegionCode] = useState(DEFAULT_VIEWER_REGION_CODE);
  const [actionError, setActionError] = useState("");
  const [pendingListId, setPendingListId] = useState<string | null>(null);

  const lists = useMemo(() => listsQuery.data ?? [], [listsQuery.data]);
  const phase = listsQuery.isPending
    ? "loading"
    : listsQuery.isError
      ? "error"
      : "success";
  const isRefreshing = listsQuery.isRefetching;
  const queryError =
    listsQuery.error instanceof Error
      ? listsQuery.error.message
      : POPULAR_CATEGORIES_ADMIN_PAGE_UI.LOAD_ERROR;

  const isBusy =
    createMutation.isPending ||
    patchMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending ||
    addItemMutation.isPending ||
    removeItemMutation.isPending;

  const filteredLists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return lists;
    }
    return lists.filter(
      (list) =>
        list.title.toLowerCase().includes(query) ||
        String(list.regionCode ?? "")
          .toLowerCase()
          .includes(query) ||
        list.items.some(
          (item) =>
            item.refId.toLowerCase().includes(query) ||
            item.itemKey.toLowerCase().includes(query),
        ),
    );
  }, [lists, searchQuery]);

  const updateListsCache = useCallback(
    (updater: (rows: CuratedCategoryListAdminRow[]) => CuratedCategoryListAdminRow[]) => {
      queryClient.setQueryData(
        curatedCategoryListQueryKeys.admin(),
        (old: CuratedCategoryListAdminRow[] | undefined) => updater(old ?? []),
      );
    },
    [queryClient],
  );

  const refetchLists = listsQuery.refetch;

  const reloadLists = useCallback(async () => {
    setActionError("");
    try {
      await refetchLists();
      await invalidateCuratedCategoryLists(queryClient);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [queryClient, refetchLists]);

  const handleCreateList = useCallback(async () => {
    setActionError("");
    const title = newTitle.trim();
    if (!title) {
      setActionError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.TITLE_REQUIRED);
      return;
    }
    if (!newRegionCode) {
      setActionError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.REGION_REQUIRED);
      return;
    }

    try {
      const created = await createMutation.mutateAsync({ title, regionCode: newRegionCode });
      updateListsCache((rows) => [...rows, created]);
      setNewTitle("");
      setNewRegionCode(DEFAULT_VIEWER_REGION_CODE);
      setIsCreateOpen(false);
      await invalidateCuratedCategoryLists(queryClient);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_ERROR,
      );
    }
  }, [createMutation, newRegionCode, newTitle, queryClient, updateListsCache]);

  const handleMoveList = useCallback(
    async (listId: string, direction: "up" | "down") => {
      const index = lists.findIndex((list) => list._id === listId);
      if (index < 0) {
        return;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= lists.length) {
        return;
      }

      const orderedListIds = lists.map((list) => list._id);
      const [moved] = orderedListIds.splice(index, 1);
      orderedListIds.splice(targetIndex, 0, moved);

      setPendingListId(listId);
      setActionError("");
      try {
        const nextLists = await reorderMutation.mutateAsync(orderedListIds);
        updateListsCache(() => nextLists);
        await invalidateCuratedCategoryLists(queryClient);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.REORDER_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [lists, queryClient, reorderMutation, updateListsCache],
  );

  const handleDeleteList = useCallback(
    async (listId: string) => {
      setPendingListId(listId);
      setActionError("");
      try {
        await deleteMutation.mutateAsync(listId);
        updateListsCache((rows) => rows.filter((list) => list._id !== listId));
        await invalidateCuratedCategoryLists(queryClient);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [deleteMutation, queryClient, updateListsCache],
  );

  const handleSaveList = useCallback(
    async (listId: string, payload: { title: string; regionCode: string }) => {
      setPendingListId(listId);
      try {
        const updated = await patchMutation.mutateAsync({
          listId,
          body: { title: payload.title.trim(), regionCode: payload.regionCode },
        });
        updateListsCache((rows) => rows.map((list) => (list._id === listId ? updated : list)));
        await invalidateCuratedCategoryLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [patchMutation, queryClient, updateListsCache],
  );

  const handleAddCategory = useCallback(
    async (listId: string, payload: { kind: CuratedCategoryKind; refId: string }) => {
      setPendingListId(listId);
      try {
        const updated = await addItemMutation.mutateAsync({
          listId,
          kind: payload.kind,
          refId: payload.refId,
        });
        updateListsCache((rows) => rows.map((list) => (list._id === listId ? updated : list)));
        await invalidateCuratedCategoryLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [addItemMutation, queryClient, updateListsCache],
  );

  const handleRemoveCategory = useCallback(
    async (listId: string, itemKey: string) => {
      setPendingListId(listId);
      try {
        const updated = await removeItemMutation.mutateAsync({ listId, itemKey });
        updateListsCache((rows) => rows.map((list) => (list._id === listId ? updated : list)));
        await invalidateCuratedCategoryLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [queryClient, removeItemMutation, updateListsCache],
  );

  const displayError = phase === "error" ? queryError : actionError;

  return {
    lists,
    phase,
    isRefreshing,
    queryError,
    searchQuery,
    setSearchQuery,
    isCreateOpen,
    setIsCreateOpen,
    newTitle,
    setNewTitle,
    newRegionCode,
    setNewRegionCode,
    displayError,
    pendingListId,
    isBusy,
    filteredLists,
    handleCreateList,
    handleMoveList,
    handleDeleteList,
    handleSaveList,
    handleAddCategory,
    handleRemoveCategory,
    reloadLists,
    refetchLists,
  };
};
