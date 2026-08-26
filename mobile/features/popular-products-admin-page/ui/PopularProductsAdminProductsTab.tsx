import { useFocusEffect } from "@react-navigation/native";
import { useCallback, type ReactNode } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { RuRegionSelect } from "@/entities/region/ui/RuRegionSelect";
import { CuratedProductListAdminCard } from "@/features/popular-products-admin-page/ui/CuratedProductListAdminCard";
import { usePopularProductsAdminPage } from "@/features/popular-products-admin-page/model/usePopularProductsAdminPage";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";
import { AdminPanelShell } from "@/shared/ui/AdminPanelShell";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type PopularProductsAdminProductsTabProps = {
  topSlot?: ReactNode;
};

export const PopularProductsAdminProductsTab = ({
  topSlot,
}: PopularProductsAdminProductsTabProps) => {
  const styles = useAdminPanelStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();

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
    handleAddProduct,
    handleRemoveProduct,
    reloadLists,
    refetchLists,
  } = usePopularProductsAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchLists();
    }, [refetchLists]),
  );

  const pageListStyle = [
    styles.pageContainer,
    styles.pageList,
    !isDrawerLayout ? styles.pageListInAccountShell : null,
  ];

  const confirmDeleteList = (listId: string) => {
    Alert.alert(
      POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST,
      POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST_CONFIRM,
      [
        { text: POPULAR_PRODUCTS_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
        {
          text: POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST,
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
        <Text style={styles.fieldLabel}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_TITLE_LABEL}</Text>
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
        label={POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_REGION_LABEL}
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
          <Text style={styles.primaryButtonText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_LIST}</Text>
        </Pressable>
      </View>
    </>
  );

  const listContent = (() => {
    if (phase === "success" && filteredLists.length === 0) {
      return (
        <Text style={[styles.alert, styles.alertInfo]}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.EMPTY}</Text>
      );
    }
    return null;
  })();

  const shellProps = {
    title: POPULAR_PRODUCTS_ADMIN_PAGE_UI.TITLE,
    hint: POPULAR_PRODUCTS_ADMIN_PAGE_UI.HINT,
    searchValue: searchQuery,
    onSearchChange: setSearchQuery,
    searchPlaceholder: POPULAR_PRODUCTS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER,
    onRefresh: () => void reloadLists(),
    isCreateOpen,
    onToggleCreate: () => setIsCreateOpen((open) => !open),
    createHeading: POPULAR_PRODUCTS_ADMIN_PAGE_UI.CREATE_HEADING,
    createPanel,
    topSlot,
  };

  if (phase === "loading" && lists.length === 0) {
    return (
      <View style={[...pageListStyle, centeredContentStyle]}>
        <AdminPanelShell {...shellProps} count={0} isLoading error={displayError}>
          {null}
        </AdminPanelShell>
      </View>
    );
  }

  if (phase === "error" && lists.length === 0) {
    return (
      <View style={[...pageListStyle, centeredContentStyle]}>
        <AdminPanelShell {...shellProps} count={0} isLoading={false} error={displayError}>
          <ScreenErrorState message={queryError} onRetry={() => void reloadLists()} />
        </AdminPanelShell>
      </View>
    );
  }

  return (
    <ProfileAccountList
      data={filteredLists}
      keyExtractor={(item) => `${item._id}-${item.updatedAt ?? ""}-${item.productIds.length}`}
      style={[...pageListStyle, scrollEnabled ? centeredContentStyle : null]}
      contentContainerStyle={{
        paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom,
        gap: 8,
      }}
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
          <CuratedProductListAdminCard
            list={item}
            isFirst={index === 0}
            isLast={index === lists.length - 1}
            isBusy={isBusy && pendingListId === item._id}
            onMoveUp={() => void handleMoveList(item._id, "up")}
            onMoveDown={() => void handleMoveList(item._id, "down")}
            onDeleteList={() => confirmDeleteList(item._id)}
            onSaveList={(payload) => handleSaveList(item._id, payload)}
            onAddProduct={(productId) => handleAddProduct(item._id, productId)}
            onRemoveProduct={(productId) => handleRemoveProduct(item._id, productId)}
          />
        );
      }}
    />
  );
};
