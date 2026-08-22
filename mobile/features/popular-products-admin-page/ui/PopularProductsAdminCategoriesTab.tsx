import { useFocusEffect } from "@react-navigation/native";
import { useCallback, type ReactNode } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { RuRegionSelect } from "@/entities/region/ui/RuRegionSelect";
import { CuratedCategoryListAdminCard } from "@/features/popular-products-admin-page/ui/CuratedCategoryListAdminCard";
import { usePopularCategoriesAdminPage } from "@/features/popular-products-admin-page/model/usePopularCategoriesAdminPage";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";
import { AdminPanelShell } from "@/shared/ui/AdminPanelShell";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type PopularProductsAdminCategoriesTabProps = {
  topSlot?: ReactNode;
};

export const PopularProductsAdminCategoriesTab = ({
  topSlot,
}: PopularProductsAdminCategoriesTabProps) => {
  const styles = useAdminPanelStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();

  const {
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
  } = usePopularCategoriesAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchLists();
    }, [refetchLists]),
  );

  const confirmDeleteList = (listId: string) => {
    Alert.alert(
      POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_LIST,
      POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_LIST_CONFIRM,
      [
        { text: POPULAR_CATEGORIES_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
        {
          text: POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_LIST,
          style: "destructive",
          onPress: () => {
            void handleDeleteList(listId);
          },
        },
      ],
    );
  };

  const createPanel = (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_TITLE_LABEL}</Text>
        <TextInput
          style={styles.fieldInput}
          value={newTitle}
          maxLength={60}
          onChangeText={setNewTitle}
          editable={!isBusy}
        />
      </View>
      <RuRegionSelect
        value={newRegionCode}
        onChange={setNewRegionCode}
        disabled={isBusy}
        label={POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_REGION_LABEL}
        required
      />
      <View style={styles.createActions}>
        <Pressable
          style={[
            styles.primaryButton,
            (isBusy || newTitle.trim() === "" || !newRegionCode) && styles.primaryButtonDisabled,
          ]}
          disabled={isBusy || newTitle.trim() === "" || !newRegionCode}
          onPress={() => void handleCreateList()}
        >
          <Text style={styles.primaryButtonText}>
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_LIST}
          </Text>
        </Pressable>
      </View>
    </>
  );

  const listContent = (() => {
    if (phase === "success" && filteredLists.length === 0) {
      return (
        <Text style={[styles.alert, styles.alertInfo]}>
          {POPULAR_CATEGORIES_ADMIN_PAGE_UI.EMPTY}
        </Text>
      );
    }
    return null;
  })();

  const shellProps = {
    title: POPULAR_CATEGORIES_ADMIN_PAGE_UI.TITLE,
    hint: POPULAR_CATEGORIES_ADMIN_PAGE_UI.HINT,
    searchValue: searchQuery,
    onSearchChange: setSearchQuery,
    searchPlaceholder: POPULAR_CATEGORIES_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER,
    onRefresh: () => void reloadLists(),
    isCreateOpen,
    onToggleCreate: () => setIsCreateOpen((open) => !open),
    createHeading: POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_HEADING,
    createPanel,
    topSlot,
  };

  if (phase === "loading" && lists.length === 0) {
    return (
      <View style={[styles.pageContainer, centeredContentStyle, styles.pageList]}>
        <AdminPanelShell {...shellProps} count={0} isLoading error={displayError}>
          {null}
        </AdminPanelShell>
      </View>
    );
  }

  if (phase === "error" && lists.length === 0) {
    return (
      <View style={[styles.pageContainer, centeredContentStyle, styles.pageList]}>
        <AdminPanelShell {...shellProps} count={0} isLoading={false} error={displayError}>
          <ScreenErrorState message={queryError} onRetry={() => void reloadLists()} />
        </AdminPanelShell>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.pageContainer, styles.pageList, centeredContentStyle]}
      contentContainerStyle={{ paddingBottom: contentPaddingBottom, gap: 8 }}
      data={filteredLists}
      keyExtractor={(item) => `${item._id}-${item.updatedAt ?? ""}-${item.items.length}`}
      refreshControl={
        <ThemedRefreshControl refreshing={isRefreshing} onRefresh={() => void reloadLists()} />
      }
      ListHeaderComponent={
        <AdminPanelShell
          {...shellProps}
          count={lists.length}
          filteredCount={searchQuery.trim() ? filteredLists.length : undefined}
          isLoading={false}
          isRefreshing={isRefreshing}
          error={displayError}
        >
          {listContent}
        </AdminPanelShell>
      }
      renderItem={({ item }) => {
        const index = lists.findIndex((row) => row._id === item._id);
        return (
          <CuratedCategoryListAdminCard
            list={item}
            isFirst={index === 0}
            isLast={index === lists.length - 1}
            isBusy={isBusy && pendingListId === item._id}
            onMoveUp={() => void handleMoveList(item._id, "up")}
            onMoveDown={() => void handleMoveList(item._id, "down")}
            onDeleteList={() => confirmDeleteList(item._id)}
            onSaveList={(payload) => handleSaveList(item._id, payload)}
            onAddCategory={(payload) => handleAddCategory(item._id, payload)}
            onRemoveCategory={(itemKey) => handleRemoveCategory(item._id, itemKey)}
          />
        );
      }}
    />
  );
};
