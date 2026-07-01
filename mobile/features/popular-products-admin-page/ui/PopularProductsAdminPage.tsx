import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { CuratedProductListAdminCard } from "@/features/popular-products-admin-page/ui/CuratedProductListAdminCard";
import { usePopularProductsAdminPage } from "@/features/popular-products-admin-page/model/usePopularProductsAdminPage";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";
import { AdminPanelShell } from "@/shared/ui/AdminPanelShell";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const PopularProductsAdminPage = () => {
  const router = useRouter();
  const styles = useAdminPanelStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

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
  } = usePopularProductsAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchLists();
    }, [refetchLists]),
  );

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
      <View style={styles.createActions}>
        <Pressable
          style={[
            styles.primaryButton,
            (isBusy || newTitle.trim() === "") && styles.primaryButtonDisabled,
          ]}
          disabled={isBusy || newTitle.trim() === ""}
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

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_POPULAR_PRODUCTS_ADMIN}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="popular-products-admin"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

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
    topSlot: sectionToggle,
  };

  if (phase === "loading" && lists.length === 0) {
    return (
      <>
        <View style={[styles.pageContainer, centeredContentStyle, styles.pageList]}>
          <AdminPanelShell {...shellProps} count={0} isLoading error={displayError}>
            {null}
          </AdminPanelShell>
        </View>
        {navSheet}
      </>
    );
  }

  if (phase === "error" && lists.length === 0) {
    return (
      <>
        <View style={[styles.pageContainer, centeredContentStyle, styles.pageList]}>
          <AdminPanelShell {...shellProps} count={0} isLoading={false} error={displayError}>
            <ScreenErrorState message={queryError} onRetry={() => void reloadLists()} />
          </AdminPanelShell>
        </View>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <FlatList
        style={[styles.pageContainer, styles.pageList, centeredContentStyle]}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom, gap: 8 }}
        data={filteredLists}
        keyExtractor={(item) => `${item._id}-${item.updatedAt ?? ""}-${item.productIds.length}`}
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
              onSaveTitle={(title) => handleSaveTitle(item._id, title)}
              onAddProduct={(productId) => handleAddProduct(item._id, productId)}
              onRemoveProduct={(productId) => handleRemoveProduct(item._id, productId)}
            />
          );
        }}
      />
      {navSheet}
    </>
  );
};
