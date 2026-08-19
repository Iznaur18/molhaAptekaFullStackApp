import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import { invalidateCuratedCategoryLists } from "../../../entities/curated-category-list/lib/curatedCategoryListQueryCache.js";
import { curatedCategoryListQueryKeys } from "../../../entities/curated-category-list/model/curatedCategoryListQueryKeys.js";
import { useCuratedCategoryListAdminMutations } from "../../../entities/curated-category-list/model/useCuratedCategoryListAdminMutations.js";
import { useCuratedCategoryListsAdminQuery } from "../../../entities/curated-category-list/model/useCuratedCategoryListsAdminQuery.js";
import { RuRegionSelect } from "../../../entities/region/ui/RuRegionSelect.jsx";
import { AdminPanelShell } from "../../../shared/ui/AdminPanel/AdminPanelShell.jsx";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { CuratedCategoryListAdminCard } from "./CuratedCategoryListAdminCard.jsx";

export function PopularProductsAdminCategoriesTab() {
  const queryClient = useQueryClient();
  const {
    createMutation,
    patchMutation,
    deleteMutation,
    reorderMutation,
    addItemMutation,
    removeItemMutation,
  } = useCuratedCategoryListAdminMutations();
  const listsQuery = useCuratedCategoryListsAdminQuery();

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
      : POPULAR_CATEGORIES_ADMIN_PAGE_UI.LOAD_ERROR;

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
        list.items.some(
          (item) =>
            item.refId.toLowerCase().includes(query) ||
            item.itemKey.toLowerCase().includes(query),
        ),
    );
  }, [lists, searchQuery]);

  const updateListsCache = useCallback(
    (
      /** @type {(rows: import('../../../entities/curated-category-list/model/types.js').CuratedCategoryListFromApi[]) => import('../../../entities/curated-category-list/model/types.js').CuratedCategoryListFromApi[]} */ updater,
    ) => {
      queryClient.setQueryData(curatedCategoryListQueryKeys.admin(), (old) => updater(old ?? []));
    },
    [queryClient],
  );

  const reloadLists = useCallback(async () => {
    await invalidateCuratedCategoryLists(queryClient);
  }, [queryClient]);

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
      const list = await createMutation.mutateAsync({
        title,
        regionCode: newRegionCode,
      });
      updateListsCache((rows) => [...rows, list]);
      setNewTitle("");
      setIsCreateOpen(false);
      await invalidateCuratedCategoryLists(queryClient);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_ERROR,
      );
    }
  }, [createMutation, newRegionCode, newTitle, queryClient, updateListsCache]);

  const handleMoveList = useCallback(
    async (listId, direction) => {
      setActionError("");
      const index = lists.findIndex((row) => row._id === listId);
      if (index < 0) {
        return;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= lists.length) {
        return;
      }

      const orderedListIds = lists.map((row) => row._id);
      [orderedListIds[index], orderedListIds[targetIndex]] = [
        orderedListIds[targetIndex],
        orderedListIds[index],
      ];

      setPendingListId(listId);
      try {
        const nextLists = await reorderMutation.mutateAsync(orderedListIds);
        queryClient.setQueryData(curatedCategoryListQueryKeys.admin(), nextLists);
        await invalidateCuratedCategoryLists(queryClient);
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.REORDER_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [lists, queryClient, reorderMutation],
  );

  const handleDeleteList = useCallback(
    async (listId) => {
      setActionError("");
      if (!window.confirm(POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_LIST_CONFIRM)) {
        return;
      }

      setPendingListId(listId);
      try {
        await deleteMutation.mutateAsync(listId);
        updateListsCache((rows) => rows.filter((row) => row._id !== listId));
        await invalidateCuratedCategoryLists(queryClient);
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [deleteMutation, queryClient, updateListsCache],
  );

  const handleSaveList = useCallback(
    async (listId, payload) => {
      setActionError("");
      setPendingListId(listId);
      try {
        const list = await patchMutation.mutateAsync({ listId, body: payload });
        updateListsCache((rows) => rows.map((row) => (row._id === listId ? list : row)));
        await invalidateCuratedCategoryLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [patchMutation, queryClient, updateListsCache],
  );

  const handleAddCategory = useCallback(
    async (listId, payload) => {
      setActionError("");
      setPendingListId(listId);
      try {
        const list = await addItemMutation.mutateAsync({
          listId,
          kind: payload.kind,
          refId: payload.refId,
        });
        updateListsCache((rows) => rows.map((row) => (row._id === listId ? list : row)));
        await invalidateCuratedCategoryLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [addItemMutation, queryClient, updateListsCache],
  );

  const handleRemoveCategory = useCallback(
    async (listId, itemKey) => {
      setActionError("");
      setPendingListId(listId);
      try {
        const list = await removeItemMutation.mutateAsync({ listId, itemKey });
        updateListsCache((rows) => rows.map((row) => (row._id === listId ? list : row)));
        await invalidateCuratedCategoryLists(queryClient);
      } finally {
        setPendingListId(null);
      }
    },
    [queryClient, removeItemMutation, updateListsCache],
  );

  return (
    <AdminPanelShell
      title={POPULAR_CATEGORIES_ADMIN_PAGE_UI.TITLE}
      hint={POPULAR_CATEGORIES_ADMIN_PAGE_UI.HINT}
      count={lists.length}
      filteredCount={filteredLists.length}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={POPULAR_CATEGORIES_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
      onRefresh={() => void reloadLists()}
      isLoading={phase === "loading"}
      isRefreshing={isRefreshing}
      error={phase === "error" ? error : actionError}
      isCreateOpen={isCreateOpen}
      onToggleCreate={() => setIsCreateOpen((open) => !open)}
      createHeading={POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_HEADING}
      createPanel={
        <div className="popular-products-admin__create">
          <label className="popular-products-admin__label">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_TITLE_LABEL}
            <input
              className="popular-products-admin__input"
              value={newTitle}
              maxLength={60}
              onChange={(event) => setNewTitle(event.target.value)}
              disabled={isBusy}
            />
          </label>
          <label className="popular-products-admin__label">
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_REGION_LABEL}
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
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_LIST}
          </button>
        </div>
      }
    >
      {phase === "success" && filteredLists.length === 0 ? (
        <p className="popular-products-admin__empty">
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.EMPTY}
        </p>
      ) : null}
      <div className="popular-products-admin__lists">
        {filteredLists.map((list) => (
          <CuratedCategoryListAdminCard
            key={`${list._id}-${list.updatedAt ?? ""}-${list.items.length}`}
            list={list}
            isFirst={lists.findIndex((row) => row._id === list._id) === 0}
            isLast={lists.findIndex((row) => row._id === list._id) === lists.length - 1}
            isBusy={isBusy && pendingListId === list._id}
            onMoveUp={() => void handleMoveList(list._id, "up")}
            onMoveDown={() => void handleMoveList(list._id, "down")}
            onDeleteList={() => void handleDeleteList(list._id)}
            onSaveList={(payload) => handleSaveList(list._id, payload)}
            onAddCategory={(payload) => handleAddCategory(list._id, payload)}
            onRemoveCategory={(itemKey) => handleRemoveCategory(list._id, itemKey)}
          />
        ))}
      </div>
    </AdminPanelShell>
  );
}
