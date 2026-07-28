import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import { invalidateCuratedProductLists } from "../../../entities/curated-product-list/lib/curatedProductListQueryCache.js";
import { curatedProductListQueryKeys } from "../../../entities/curated-product-list/model/curatedProductListQueryKeys.js";
import { useCuratedProductListAdminMutations } from "../../../entities/curated-product-list/model/useCuratedProductListAdminMutations.js";
import { useCuratedProductListsAdminQuery } from "../../../entities/curated-product-list/model/useCuratedProductListsAdminQuery.js";
import { RuRegionSelect } from "../../../entities/region/ui/RuRegionSelect.jsx";
import { AdminPanelShell } from "../../../shared/ui/AdminPanel/AdminPanelShell.jsx";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { CuratedProductListAdminCard } from "./CuratedProductListAdminCard.jsx";

import "./PopularProductsAdminPage.css";

export function PopularProductsAdminPage() {
  const queryClient = useQueryClient();
  const {
    createMutation,
    patchMutation,
    deleteMutation,
    reorderMutation,
    addItemMutation,
    removeItemMutation,
  } = useCuratedProductListAdminMutations();
  const listsQuery = useCuratedProductListsAdminQuery();

  const lists = useMemo(() => listsQuery.data ?? [], [listsQuery.data]);
  const phase = listsQuery.isPending
    ? "loading"
    : listsQuery.isError
      ? "error"
      : "success";
  const isRefreshing = listsQuery.isFetching && !listsQuery.isPending;
  const error =
    listsQuery.error instanceof Error
      ? listsQuery.error.message
      : POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR;

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRegionCode, setNewRegionCode] = useState(DEFAULT_VIEWER_REGION_CODE);
  const [actionError, setActionError] = useState("");
  const [pendingListId, setPendingListId] = useState(null);

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
        list.productIds.some((productId) => productId.toLowerCase().includes(query)),
    );
  }, [lists, searchQuery]);

  const updateListsCache = useCallback(
    (
      /** @type {(rows: import('../../../entities/curated-product-list/model/types.js').CuratedProductListFromApi[]) => import('../../../entities/curated-product-list/model/types.js').CuratedProductListFromApi[]} */ updater,
    ) => {
      queryClient.setQueryData(curatedProductListQueryKeys.admin(), (old) => updater(old ?? []));
    },
    [queryClient],
  );

  const reloadLists = useCallback(async () => {
    setActionError("");
    try {
      await listsQuery.refetch();
      await invalidateCuratedProductLists(queryClient);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [listsQuery, queryClient]);

  const handleCreateList = useCallback(async () => {
    setActionError("");
    const title = newTitle.trim();
    if (!title) {
      setActionError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.TITLE_REQUIRED);
      return;
    }
    if (!newRegionCode) {
      setActionError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.REGION_REQUIRED);
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        title,
        regionCode: newRegionCode,
      });
      updateListsCache((rows) => [...rows, created]);
      setNewTitle("");
      setNewRegionCode(DEFAULT_VIEWER_REGION_CODE);
      setIsCreateOpen(false);
      await invalidateCuratedProductLists(queryClient);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_ERROR,
      );
    }
  }, [createMutation, newRegionCode, newTitle, queryClient, updateListsCache]);

  const handleMoveList = useCallback(
    async (listId, direction) => {
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
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.REORDER_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [lists, queryClient, reorderMutation, updateListsCache],
  );

  const handleDeleteList = useCallback(
    async (listId) => {
      if (!window.confirm(POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST_CONFIRM)) {
        return;
      }

      setPendingListId(listId);
      setActionError("");
      try {
        await deleteMutation.mutateAsync(listId);
        updateListsCache((rows) => rows.filter((list) => list._id !== listId));
        await invalidateCuratedProductLists(queryClient);
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [deleteMutation, queryClient, updateListsCache],
  );

  const handleSaveList = useCallback(
    async (listId, { title, regionCode }) => {
      setPendingListId(listId);
      try {
        const updated = await patchMutation.mutateAsync({
          listId,
          body: { title: title.trim(), regionCode },
        });
        updateListsCache((rows) =>
          rows.map((list) => (list._id === listId ? updated : list)),
        );
        await invalidateCuratedProductLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [patchMutation, queryClient, updateListsCache],
  );

  const handleAddProduct = useCallback(
    async (listId, productId) => {
      setPendingListId(listId);
      try {
        const updated = await addItemMutation.mutateAsync({ listId, productId });
        updateListsCache((rows) =>
          rows.map((list) => (list._id === listId ? updated : list)),
        );
        await invalidateCuratedProductLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [addItemMutation, queryClient, updateListsCache],
  );

  const handleRemoveProduct = useCallback(
    async (listId, productId) => {
      setPendingListId(listId);
      try {
        const updated = await removeItemMutation.mutateAsync({ listId, productId });
        updateListsCache((rows) =>
          rows.map((list) => (list._id === listId ? updated : list)),
        );
        await invalidateCuratedProductLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [queryClient, removeItemMutation, updateListsCache],
  );

  return (
    <AdminPanelShell
      title={POPULAR_PRODUCTS_ADMIN_PAGE_UI.TITLE}
      hint={POPULAR_PRODUCTS_ADMIN_PAGE_UI.HINT}
      count={lists.length}
      filteredCount={filteredLists.length}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={POPULAR_PRODUCTS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
      onRefresh={() => void reloadLists()}
      isLoading={phase === "loading"}
      isRefreshing={isRefreshing}
      error={phase === "error" ? error : actionError}
      isCreateOpen={isCreateOpen}
      onToggleCreate={() => setIsCreateOpen((open) => !open)}
      createHeading={POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_HEADING}
      createPanel={
        <div className="popular-products-admin__create">
          <label className="popular-products-admin__label">
            {POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_TITLE_LABEL}
            <input
              className="popular-products-admin__input"
              value={newTitle}
              maxLength={60}
              onChange={(event) => setNewTitle(event.target.value)}
              disabled={isBusy}
            />
          </label>
          <label className="popular-products-admin__label">
            {POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_REGION_LABEL}
            <RuRegionSelect
              value={newRegionCode}
              onChange={setNewRegionCode}
              disabled={isBusy}
              required
            />
          </label>
          <button
            type="button"
            className="app-btn app-btn--primary"
            onClick={() => void handleCreateList()}
            disabled={isBusy || newTitle.trim() === "" || !newRegionCode}
          >
            {POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_LIST}
          </button>
        </div>
      }
    >
      {phase === "success" && filteredLists.length === 0 ? (
        <p className="popular-products-admin__empty">{POPULAR_PRODUCTS_ADMIN_PAGE_UI.EMPTY}</p>
      ) : null}
      <div className="popular-products-admin__lists">
        {filteredLists.map((list) => (
          <CuratedProductListAdminCard
            key={`${list._id}-${list.updatedAt ?? ""}-${list.productIds.length}`}
            list={list}
            isFirst={lists.findIndex((row) => row._id === list._id) === 0}
            isLast={lists.findIndex((row) => row._id === list._id) === lists.length - 1}
            isBusy={isBusy && pendingListId === list._id}
            onMoveUp={() => void handleMoveList(list._id, "up")}
            onMoveDown={() => void handleMoveList(list._id, "down")}
            onDeleteList={() => void handleDeleteList(list._id)}
            onSaveList={(payload) => handleSaveList(list._id, payload)}
            onAddProduct={(productId) => handleAddProduct(list._id, productId)}
            onRemoveProduct={(productId) => handleRemoveProduct(list._id, productId)}
          />
        ))}
      </div>
    </AdminPanelShell>
  );
}
