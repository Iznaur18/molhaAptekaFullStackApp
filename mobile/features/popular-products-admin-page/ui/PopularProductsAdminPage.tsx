import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { CuratedListAdminRow } from "@/entities/curated-product-list/api/curatedProductListAdminApi";
import { useCuratedProductListAdminMutations } from "@/entities/curated-product-list/model/useCuratedProductListAdminMutations";
import { useCuratedProductListsAdminQuery } from "@/entities/curated-product-list/model/useCuratedProductListsAdminQuery";
import { CuratedProductListAdminCard } from "@/features/popular-products-admin-page/ui/CuratedProductListAdminCard";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";
import { useStaffAdminStyles } from "@/shared/theme/staffAdminStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const PopularProductsAdminPage = () => {
  const styles = useStaffAdminStyles();
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

  const isBusy =
    createMutation.isPending ||
    patchMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending ||
    addItemMutation.isPending ||
    removeItemMutation.isPending;

  const handleCreateList = useCallback(async () => {
    setActionError("");
    const title = newTitle.trim();
    if (!title) {
      setActionError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.TITLE_REQUIRED);
      return;
    }
    try {
      await createMutation.mutateAsync({ title });
      setNewTitle("");
      setIsCreateOpen(false);
      await listsQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_ERROR,
      );
    }
  }, [createMutation, listsQuery, newTitle]);

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
        await reorderMutation.mutateAsync(orderedListIds);
        await listsQuery.refetch();
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR,
        );
      } finally {
        setPendingListId(null);
      }
    },
    [lists, listsQuery, reorderMutation],
  );

  const handleDeleteList = useCallback(
    (listId: string) => {
      Alert.alert(
        POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST,
        POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST_CONFIRM,
        [
          { text: "Отмена", style: "cancel" },
          {
            text: POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST,
            style: "destructive",
            onPress: () => {
              void (async () => {
                setPendingListId(listId);
                setActionError("");
                try {
                  await deleteMutation.mutateAsync(listId);
                  await listsQuery.refetch();
                } catch (error) {
                  setActionError(
                    error instanceof Error
                      ? error.message
                      : POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_ERROR,
                  );
                } finally {
                  setPendingListId(null);
                }
              })();
            },
          },
        ],
      );
    },
    [deleteMutation, listsQuery],
  );

  const handleSaveTitle = useCallback(
    async (listId: string, title: string) => {
      setPendingListId(listId);
      try {
        await patchMutation.mutateAsync({ listId, body: { title: title.trim() } });
        await listsQuery.refetch();
      } finally {
        setPendingListId(null);
      }
    },
    [listsQuery, patchMutation],
  );

  const handleAddProduct = useCallback(
    async (listId: string, productId: string) => {
      setPendingListId(listId);
      try {
        await addItemMutation.mutateAsync({ listId, productId });
        await listsQuery.refetch();
      } finally {
        setPendingListId(null);
      }
    },
    [addItemMutation, listsQuery],
  );

  const handleRemoveProduct = useCallback(
    async (listId: string, productId: string) => {
      setPendingListId(listId);
      try {
        await removeItemMutation.mutateAsync({ listId, productId });
        await listsQuery.refetch();
      } finally {
        setPendingListId(null);
      }
    },
    [listsQuery, removeItemMutation],
  );

  if (listsQuery.isPending && lists.length === 0) {
    return <ScreenLoadingState message={POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOADING} />;
  }

  if (listsQuery.isError && lists.length === 0) {
    return (
      <ScreenErrorState
        message={
          listsQuery.error instanceof Error
            ? listsQuery.error.message
            : POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR
        }
        onRetry={() => void listsQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={filteredLists}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={listsQuery.isFetching} onRefresh={() => void listsQuery.refetch()} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            style={styles.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Заголовок или productId…"
          />
          <Pressable style={styles.toggleCreate} onPress={() => setIsCreateOpen((open) => !open)}>
            <Text style={styles.toggleCreateText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_CREATE}</Text>
          </Pressable>
          {isCreateOpen ? (
            <View style={styles.panel}>
              <Text style={styles.label}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_TITLE_LABEL}</Text>
              <TextInput
                style={styles.input}
                value={newTitle}
                maxLength={60}
                onChangeText={setNewTitle}
                editable={!isBusy}
              />
              <Pressable
                style={[styles.primaryButton, isBusy && styles.disabled]}
                onPress={() => void handleCreateList()}
                disabled={isBusy || !newTitle.trim()}
              >
                <Text style={styles.primaryButtonText}>
                  {POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_LIST}
                </Text>
              </Pressable>
            </View>
          ) : null}
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => {
        const index = lists.findIndex((row) => row._id === item._id);
        return (
          <CuratedProductListAdminCard
            list={item}
            isFirst={index === 0}
            isLast={index === lists.length - 1}
            isBusy={isBusy && pendingListId === item._id}
            onMoveUp={() => void handleMoveList(item._id, "up")}
            onMoveDown={() => void handleMoveList(item._id, "down")}
            onDeleteList={() => handleDeleteList(item._id)}
            onSaveTitle={(title) => handleSaveTitle(item._id, title)}
            onAddProduct={(productId) => handleAddProduct(item._id, productId)}
            onRemoveProduct={(productId) => handleRemoveProduct(item._id, productId)}
          />
        );
      }}
    />
  );
};
