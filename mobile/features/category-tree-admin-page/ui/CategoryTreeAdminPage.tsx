import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Switch, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { ProductCategoryAdminRow } from "@/entities/product-category-tree/model/adminTypes";
import {
  findAnyLeafForReassign,
  formatCategoryLegacyDetachLabel,
  formatCategoryPath,
} from "@/features/category-tree-admin-page/lib/categoryTreeAdminUtils";
import { useCategoryTreeAdminPage } from "@/features/category-tree-admin-page/model/useCategoryTreeAdminPage";
import { CategoryTreeAdminCard } from "@/features/category-tree-admin-page/ui/CategoryTreeAdminCard";
import { CategoryTreeLegacyPicker } from "@/features/category-tree-admin-page/ui/CategoryTreeLegacyPicker";
import { CategoryTreeParentPicker } from "@/features/category-tree-admin-page/ui/CategoryTreeParentPicker";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { CATEGORY_TREE_ADMIN_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";
import { AdminPanelShell } from "@/shared/ui/AdminPanelShell";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const CategoryTreeAdminPage = () => {
  const router = useRouter();
  const styles = useAdminPanelStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const {
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
  } = useCategoryTreeAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchCategories();
    }, [refetchCategories]),
  );

  const handleDelete = (row: ProductCategoryAdminRow) => {
    Alert.alert(
      CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON,
      CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_CONFIRM,
      [
        { text: CATEGORY_TREE_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
        {
          text: CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON,
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await runDelete(row);
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR;
                const hasProducts = /привязаны товары/i.test(message);
                if (!hasProducts) {
                  setActionError(message);
                  return;
                }

                const reassignLeaf = findAnyLeafForReassign(row, rows);
                if (reassignLeaf) {
                  Alert.alert(
                    CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON,
                    CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_REASSIGN_CONFIRM(
                      message,
                      formatCategoryPath(reassignLeaf),
                    ),
                    [
                      { text: CATEGORY_TREE_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
                      {
                        text: CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON,
                        style: "destructive",
                        onPress: () => {
                          void runDelete(row, {
                            reassignProductCategoryId: reassignLeaf._id,
                          }).catch((retryError) => {
                            setActionError(
                              retryError instanceof Error
                                ? retryError.message
                                : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR,
                            );
                          });
                        },
                      },
                    ],
                  );
                  return;
                }

                Alert.alert(
                  CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON,
                  CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_DETACH_CONFIRM(
                    message,
                    formatCategoryLegacyDetachLabel(row),
                  ),
                  [
                    { text: CATEGORY_TREE_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
                    {
                      text: CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON,
                      style: "destructive",
                      onPress: () => {
                        void runDelete(row, { detachProducts: true }).catch((retryError) => {
                          setActionError(
                            retryError instanceof Error
                              ? retryError.message
                              : CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_ERROR,
                          );
                        });
                      },
                    },
                  ],
                );
              }
            })();
          },
        },
      ],
    );
  };

  const createPanel = (
    <>
      <View style={styles.formGrid}>
        <View style={[styles.field, styles.fieldFull]}>
          <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_SLUG}</Text>
          <TextInput
            style={styles.fieldInput}
            value={newSlug}
            onChangeText={setNewSlug}
            editable={pendingId !== "create"}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.fieldHint}>{CATEGORY_TREE_ADMIN_PAGE_UI.SLUG_HINT}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_NAME}</Text>
          <TextInput
            style={styles.fieldInput}
            value={newLabelRu}
            onChangeText={setNewLabelRu}
            editable={pendingId !== "create"}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_PARENT}</Text>
          <CategoryTreeParentPicker
            value={newParentId}
            options={parentOptions}
            onChange={setNewParentId}
            disabled={pendingId === "create"}
          />
        </View>
        {!isCreateRoot ? (
          <>
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</Text>
              <Switch
                value={newIsLeaf}
                onValueChange={setNewIsLeaf}
                disabled={pendingId === "create"}
              />
            </View>
            <View style={[styles.field, styles.fieldFull]}>
              <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_KEYWORDS}</Text>
              <TextInput
                style={styles.fieldInput}
                value={newKeywordsCsv}
                onChangeText={setNewKeywordsCsv}
                placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.KEYWORDS_PLACEHOLDER}
                editable={pendingId !== "create"}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEGACY}</Text>
              <CategoryTreeLegacyPicker
                value={newLegacySlug}
                onChange={setNewLegacySlug}
                disabled={pendingId === "create"}
              />
            </View>
          </>
        ) : null}
      </View>
      <View style={styles.createActions}>
        <Pressable
          style={[styles.primaryButton, pendingId === "create" && styles.primaryButtonDisabled]}
          disabled={pendingId === "create"}
          onPress={() => void handleCreate()}
        >
          <Text style={styles.primaryButtonText}>{CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_BUTTON}</Text>
        </Pressable>
      </View>
    </>
  );

  const listContent = (() => {
    if (phase === "success" && rows.length === 0) {
      return (
        <Text style={[styles.alert, styles.alertInfo]}>{CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY}</Text>
      );
    }
    if (phase === "success" && filteredRows.length === 0) {
      return (
        <Text style={[styles.alert, styles.alertInfo]}>
          {CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY_FILTER}
        </Text>
      );
    }
    return null;
  })();

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_CATEGORY_TREE_ADMIN}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="category-tree-admin"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  const shellProps = {
    title: CATEGORY_TREE_ADMIN_PAGE_UI.TITLE,
    hint: CATEGORY_TREE_ADMIN_PAGE_UI.HINT,
    searchValue: searchQuery,
    onSearchChange: setSearchQuery,
    searchPlaceholder: CATEGORY_TREE_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER,
    onRefresh: () => void reloadRows({ silent: true }),
    isCreateOpen,
    onToggleCreate: () => setIsCreateOpen((open) => !open),
    createHeading: CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_HEADING,
    createPanel,
    topSlot: sectionToggle,
  };

  if (phase === "loading" && rows.length === 0) {
    return (
      <>
        <View style={[styles.pageContainer, centeredContentStyle, styles.pageList]}>
          <AdminPanelShell
            {...shellProps}
            count={0}
            isLoading
            error={displayError}
          >
            {null}
          </AdminPanelShell>
        </View>
        {navSheet}
      </>
    );
  }

  if (phase === "error" && rows.length === 0) {
    return (
      <>
        <View style={[styles.pageContainer, centeredContentStyle, styles.pageList]}>
          <AdminPanelShell
            {...shellProps}
            count={0}
            isLoading={false}
            error={displayError}
          >
            <ScreenErrorState message={queryError} onRetry={() => void reloadRows()} />
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
        data={filteredRows}
        keyExtractor={(item) => item._id}
        refreshControl={
          <ThemedRefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void reloadRows({ silent: true })}
          />
        }
        ListHeaderComponent={
          <AdminPanelShell
            {...shellProps}
            count={rows.length}
            filteredCount={searchQuery.trim() ? filteredRows.length : undefined}
            isLoading={false}
            isRefreshing={isRefreshing}
            error={displayError}
          >
            {listContent}
          </AdminPanelShell>
        }
        renderItem={({ item }) => (
          <CategoryTreeAdminCard
            row={item}
            parentOptions={parentOptions}
            isEditing={editingId === item._id}
            isPending={pendingId === item._id}
            editDraft={editDraft}
            onDraftChange={patchDraft}
            onStartEdit={() => startEdit(item)}
            onCancelEdit={cancelEdit}
            onSave={() => void handleSaveEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
      {navSheet}
    </>
  );
};
