import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { SearchSynonymRow } from "@/entities/product-search-synonym/api/searchSynonymAdminApi";
import {
  useProductSearchSynonymAdminMutations,
  useProductSearchSynonymsAdminQuery,
} from "@/entities/product-search-synonym/model/useSearchSynonymAdminMutations";
import {
  filterSynonymRows,
  sortSynonymRows,
} from "@/features/search-synonyms-admin-page/lib/searchSynonymsAdminUtils";
import { SearchSynonymAdminCard } from "@/features/search-synonyms-admin-page/ui/SearchSynonymAdminCard";
import { SynonymCategoryPicker } from "@/features/search-synonyms-admin-page/ui/SynonymCategoryPicker";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { searchSynonymAdminQueryKeys } from "@/shared/api";
import { MY_PROFILE_PAGE_UI, SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";
import { AdminPanelShell } from "@/shared/ui/AdminPanelShell";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const MIN_TOKEN_LENGTH = 3;

export const SearchSynonymsAdminPage = () => {
  const router = useRouter();
  const styles = useAdminPanelStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const queryClient = useQueryClient();
  const synonymsQuery = useProductSearchSynonymsAdminQuery();
  const { createMutation, patchMutation, deleteMutation } = useProductSearchSynonymAdminMutations();

  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editToken, setEditToken] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [newToken, setNewToken] = useState("");
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [actionError, setActionError] = useState("");

  const rows = useMemo(
    () => sortSynonymRows(synonymsQuery.data ?? []),
    [synonymsQuery.data],
  );
  const filteredRows = useMemo(
    () => filterSynonymRows(rows, searchQuery),
    [rows, searchQuery],
  );
  const phase = synonymsQuery.isPending
    ? "loading"
    : synonymsQuery.isError
      ? "error"
      : "success";
  const isRefreshing = synonymsQuery.isRefetching;
  const queryError =
    synonymsQuery.error instanceof Error
      ? synonymsQuery.error.message
      : SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR;

  useFocusEffect(
    useCallback(() => {
      void synonymsQuery.refetch();
    }, [synonymsQuery.refetch]),
  );

  const updateRows = useCallback(
    (updater: (prev: SearchSynonymRow[]) => SearchSynonymRow[]) => {
      queryClient.setQueryData(searchSynonymAdminQueryKeys.all, (old: SearchSynonymRow[] | undefined) => {
        const next = updater(old ?? []);
        return sortSynonymRows(next);
      });
    },
    [queryClient],
  );

  const reloadRows = useCallback(async () => {
    setActionError("");
    try {
      await synonymsQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [synonymsQuery.refetch]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditToken("");
    setEditCategories([]);
  }, []);

  const startEdit = useCallback((row: SearchSynonymRow) => {
    setEditingId(row._id);
    setEditToken(row.token);
    setEditCategories(row.categories ?? []);
    setActionError("");
  }, []);

  const handleCreate = async () => {
    if (newToken.trim().length < MIN_TOKEN_LENGTH) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    if (newCategories.length === 0) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }

    try {
      setPendingId("create");
      setActionError("");
      const created = await createMutation.mutateAsync({
        token: newToken.trim(),
        categories: newCategories,
      });
      updateRows((prev) => [...prev, created]);
      setNewToken("");
      setNewCategories([]);
      setIsCreateOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (synonymId: string) => {
    if (editToken.trim().length < MIN_TOKEN_LENGTH || editCategories.length === 0) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }

    try {
      setPendingId(synonymId);
      setActionError("");
      const updated = await patchMutation.mutateAsync({
        synonymId,
        body: {
          token: editToken.trim(),
          categories: editCategories,
        },
      });
      updateRows((prev) => prev.map((row) => (row._id === synonymId ? updated : row)));
      cancelEdit();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = (synonymId: string) => {
    Alert.alert(
      SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_BUTTON,
      SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_CONFIRM,
      [
        { text: SEARCH_SYNONYMS_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
        {
          text: SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_BUTTON,
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setPendingId(synonymId);
                setActionError("");
                await deleteMutation.mutateAsync(synonymId);
                updateRows((prev) => prev.filter((row) => row._id !== synonymId));
                if (editingId === synonymId) {
                  cancelEdit();
                }
              } catch (error) {
                setActionError(
                  error instanceof Error
                    ? error.message
                    : SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_ERROR,
                );
              } finally {
                setPendingId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const displayError = actionError || (phase === "error" ? queryError : "");

  const createPanel = (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_TOKEN}</Text>
        <TextInput
          style={styles.fieldInput}
          value={newToken}
          onChangeText={setNewToken}
          editable={pendingId !== "create"}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.CATEGORIES_HINT}</Text>
        <SynonymCategoryPicker
          selected={newCategories}
          onChange={setNewCategories}
          disabled={pendingId === "create"}
        />
      </View>
      <View style={styles.createActions}>
        <Pressable
          style={[
            styles.primaryButton,
            (pendingId === "create" || newCategories.length === 0) && styles.primaryButtonDisabled,
          ]}
          disabled={pendingId === "create" || newCategories.length === 0}
          onPress={() => void handleCreate()}
        >
          <Text style={styles.primaryButtonText}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_BUTTON}</Text>
        </Pressable>
      </View>
    </>
  );

  const listContent = (() => {
    if (phase === "success" && rows.length === 0) {
      return (
        <Text style={[styles.alert, styles.alertInfo]}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.EMPTY}</Text>
      );
    }
    if (phase === "success" && filteredRows.length === 0) {
      return (
        <Text style={[styles.alert, styles.alertInfo]}>
          {SEARCH_SYNONYMS_ADMIN_PAGE_UI.EMPTY_FILTER}
        </Text>
      );
    }
    return null;
  })();

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_SEARCH_SYNONYMS_ADMIN}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="search-synonyms-admin"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  const pageListStyle = [
    styles.pageContainer,
    styles.pageList,
    !isDrawerLayout ? styles.pageListInAccountShell : null,
  ];

  if (phase === "loading" && rows.length === 0) {
    return (
      <>
        <View style={[...pageListStyle, centeredContentStyle]}>
          <AdminPanelShell
            title={SEARCH_SYNONYMS_ADMIN_PAGE_UI.TITLE}
            hint={SEARCH_SYNONYMS_ADMIN_PAGE_UI.HINT}
            count={0}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={SEARCH_SYNONYMS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
            onRefresh={() => void reloadRows()}
            isLoading
            isCreateOpen={isCreateOpen}
            onToggleCreate={() => setIsCreateOpen((open) => !open)}
            createHeading={SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_HEADING}
            createPanel={createPanel}
            topSlot={sectionToggle}
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
        <View style={[...pageListStyle, centeredContentStyle]}>
          <AdminPanelShell
            title={SEARCH_SYNONYMS_ADMIN_PAGE_UI.TITLE}
            hint={SEARCH_SYNONYMS_ADMIN_PAGE_UI.HINT}
            count={0}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={SEARCH_SYNONYMS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
            onRefresh={() => void reloadRows()}
            isLoading={false}
            error={displayError}
            isCreateOpen={isCreateOpen}
            onToggleCreate={() => setIsCreateOpen((open) => !open)}
            createHeading={SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_HEADING}
            createPanel={createPanel}
            topSlot={sectionToggle}
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
      <ProfileAccountList
        data={filteredRows}
        keyExtractor={(item) => item._id}
        style={[
          ...pageListStyle,
          scrollEnabled ? centeredContentStyle : null,
        ]}
        contentContainerStyle={{
          paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom,
          gap: 8,
        }}
        refreshControl={
          <ThemedRefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void reloadRows()}
          />
        }
        ListHeaderComponent={
          <AdminPanelShell
            title={SEARCH_SYNONYMS_ADMIN_PAGE_UI.TITLE}
            hint={SEARCH_SYNONYMS_ADMIN_PAGE_UI.HINT}
            count={rows.length}
            filteredCount={searchQuery.trim() ? filteredRows.length : undefined}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={SEARCH_SYNONYMS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
            onRefresh={() => void reloadRows()}
            isLoading={false}
            isRefreshing={isRefreshing}
            error={displayError}
            isCreateOpen={isCreateOpen}
            onToggleCreate={() => setIsCreateOpen((open) => !open)}
            createHeading={SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_HEADING}
            createPanel={createPanel}
            topSlot={sectionToggle}
          >
            {listContent}
          </AdminPanelShell>
        }
        renderItem={({ item }) => (
          <SearchSynonymAdminCard
            row={item}
            isEditing={editingId === item._id}
            isPending={pendingId === item._id}
            editToken={editToken}
            editCategories={editCategories}
            onEditTokenChange={setEditToken}
            onEditCategoriesChange={setEditCategories}
            onStartEdit={() => startEdit(item)}
            onCancelEdit={cancelEdit}
            onSave={() => void handleSaveEdit(item._id)}
            onDelete={() => handleDelete(item._id)}
          />
        )}
      />

      {navSheet}
    </>
  );
};
