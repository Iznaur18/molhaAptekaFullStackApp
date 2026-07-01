import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import type { CuratedListAdminRow } from "@/entities/curated-product-list/api/curatedProductListAdminApi";
import { invalidateCuratedProductLists } from "@/entities/curated-product-list/lib/invalidateCuratedProductLists";
import { useCuratedProductListAdminMutations } from "@/entities/curated-product-list/model/useCuratedProductListAdminMutations";
import { useCuratedProductListsAdminQuery } from "@/entities/curated-product-list/model/useCuratedProductListsAdminQuery";
import { curatedProductListAdminQueryKeys } from "@/shared/api";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";

export const usePopularProductsAdminPage = () => {
  const queryClient = useQueryClient();
  const listsQuery = useCuratedProductListsAdminQuery();
  const {
    createMutation,
    patchMutation,
    deleteMutation,
    reorderMutation,
    addItemMutation,
    removeItemMutation,
  } = useCuratedProductListAdminMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
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
      : POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR;

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
        list.productIds.some((productId) => productId.toLowerCase().includes(query)),
    );
  }, [lists, searchQuery]);

  const updateListsCache = useCallback(
    (updater: (rows: CuratedListAdminRow[]) => CuratedListAdminRow[]) => {
      queryClient.setQueryData(
        curatedProductListAdminQueryKeys.all,
        (old: CuratedListAdminRow[] | undefined) => updater(old ?? []),
      );
    },
    [queryClient],
  );

  const refetchLists = listsQuery.refetch;

  const reloadLists = useCallback(async () => {
    setActionError("");
    try {
      await refetchLists();
      await invalidateCuratedProductLists(queryClient);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [queryClient, refetchLists]);

  const handleCreateList = useCallback(async () => {
    setActionError("");
    const title = newTitle.trim();
    if (!title) {
      setActionError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.TITLE_REQUIRED);
      return;
    }

    try {
      const created = await createMutation.mutateAsync({ title });
      updateListsCache((rows) => [...rows, created]);
      setNewTitle("");
      setIsCreateOpen(false);
      await invalidateCuratedProductLists(queryClient);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_ERROR,
      );
    }
  }, [createMutation, newTitle, queryClient, updateListsCache]);

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
        await invalidateCuratedProductLists(queryClient);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.REORDER_ERROR,
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
        await invalidateCuratedProductLists(queryClient);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [deleteMutation, queryClient, updateListsCache],
  );

  const handleSaveTitle = useCallback(
    async (listId: string, title: string) => {
      setPendingListId(listId);
      try {
        const updated = await patchMutation.mutateAsync({
          listId,
          body: { title: title.trim() },
        });
        updateListsCache((rows) => rows.map((list) => (list._id === listId ? updated : list)));
        await invalidateCuratedProductLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [patchMutation, queryClient, updateListsCache],
  );

  const handleAddProduct = useCallback(
    async (listId: string, productId: string) => {
      setPendingListId(listId);
      try {
        const updated = await addItemMutation.mutateAsync({ listId, productId });
        updateListsCache((rows) => rows.map((list) => (list._id === listId ? updated : list)));
        await invalidateCuratedProductLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [addItemMutation, queryClient, updateListsCache],
  );

  const handleRemoveProduct = useCallback(
    async (listId: string, productId: string) => {
      setPendingListId(listId);
      try {
        const updated = await removeItemMutation.mutateAsync({ listId, productId });
        updateListsCache((rows) => rows.map((list) => (list._id === listId ? updated : list)));
        await invalidateCuratedProductLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [queryClient, removeItemMutation, updateListsCache],
  );

  const displayError =
    phase === "error" ? queryError : actionError;

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
    displayError,
    pendingListId,
    isBusy,
    filteredLists,
    handleCreateList,
    handleMoveList,
    handleDeleteList,
    handleSaveTitle,
    handleAddProduct,
    handleRemoveProduct,
    reloadLists,
    refetchLists,
  };
};
