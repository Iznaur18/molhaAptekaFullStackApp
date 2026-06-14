import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { SearchSynonymRow } from "@/entities/product-search-synonym/api/searchSynonymAdminApi";
import {
  useProductSearchSynonymAdminMutations,
  useProductSearchSynonymsAdminQuery,
} from "@/entities/product-search-synonym/model/useSearchSynonymAdminMutations";
import { SynonymCategoryPicker } from "@/features/search-synonyms-admin-page/ui/SynonymCategoryPicker";
import { SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "@/shared/config";
import { useStaffAdminStyles } from "@/shared/theme/staffAdminStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const sortSynonymRows = (rows: SearchSynonymRow[]) =>
  [...rows].sort((a, b) => a.token.localeCompare(b.token, "ru"));

const filterSynonymRows = (rows: SearchSynonymRow[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return rows;
  }
  return rows.filter((row) => {
    const token = row.token.toLowerCase();
    const cats = row.categories.join(" ").toLowerCase();
    return token.includes(q) || cats.includes(q);
  });
};

export const SearchSynonymsAdminPage = () => {
  const styles = useStaffAdminStyles();
  const synonymsQuery = useProductSearchSynonymsAdminQuery();
  const { createMutation, patchMutation, deleteMutation } = useProductSearchSynonymAdminMutations();

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

  const cancelEdit = () => {
    setEditingId(null);
    setEditToken("");
    setEditCategories([]);
  };

  const startEdit = (row: SearchSynonymRow) => {
    setEditingId(row._id);
    setEditToken(row.token);
    setEditCategories(row.categories ?? []);
    setActionError("");
  };

  const handleCreate = async () => {
    if (newCategories.length === 0) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    setPendingId("create");
    setActionError("");
    try {
      await createMutation.mutateAsync({
        token: newToken.trim(),
        categories: newCategories,
      });
      setNewToken("");
      setNewCategories([]);
      setIsCreateOpen(false);
      await synonymsQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (synonymId: string) => {
    if (editCategories.length === 0) {
      setActionError(SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR);
      return;
    }
    setPendingId(synonymId);
    setActionError("");
    try {
      await patchMutation.mutateAsync({
        synonymId,
        body: { token: editToken.trim(), categories: editCategories },
      });
      cancelEdit();
      await synonymsQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = (synonymId: string) => {
    Alert.alert(SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE, SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_CONFIRM, [
      { text: SEARCH_SYNONYMS_ADMIN_PAGE_UI.CANCEL_BUTTON, style: "cancel" },
      {
        text: SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE,
        style: "destructive",
        onPress: () => {
          void (async () => {
            setPendingId(synonymId);
            setActionError("");
            try {
              await deleteMutation.mutateAsync(synonymId);
              if (editingId === synonymId) {
                cancelEdit();
              }
              await synonymsQuery.refetch();
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
    ]);
  };

  if (synonymsQuery.isPending && rows.length === 0) {
    return <ScreenLoadingState message={SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOADING} />;
  }

  if (synonymsQuery.isError && rows.length === 0) {
    return (
      <ScreenErrorState
        message={
          synonymsQuery.error instanceof Error
            ? synonymsQuery.error.message
            : SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR
        }
        onRetry={() => void synonymsQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={filteredRows}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={synonymsQuery.isFetching} onRefresh={() => void synonymsQuery.refetch()} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            style={styles.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={SEARCH_SYNONYMS_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
          />
          <Pressable style={styles.toggleCreate} onPress={() => setIsCreateOpen((open) => !open)}>
            <Text style={styles.toggleCreateText}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.ADD_CREATE}</Text>
          </Pressable>
          {isCreateOpen ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_HEADING}</Text>
              <Text style={styles.label}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_TOKEN}</Text>
              <TextInput
                style={styles.input}
                value={newToken}
                onChangeText={setNewToken}
                editable={pendingId !== "create"}
              />
              <Text style={styles.label}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.CATEGORIES_HINT}</Text>
              <SynonymCategoryPicker
                selected={newCategories}
                onChange={setNewCategories}
                disabled={pendingId === "create"}
              />
              <Pressable
                style={[styles.primaryButton, pendingId === "create" && styles.disabled]}
                onPress={() => void handleCreate()}
                disabled={pendingId === "create" || newCategories.length === 0}
              >
                <Text style={styles.primaryButtonText}>
                  {SEARCH_SYNONYMS_ADMIN_PAGE_UI.CREATE_BUTTON}
                </Text>
              </Pressable>
            </View>
          ) : null}
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          {rows.length === 0
            ? SEARCH_SYNONYMS_ADMIN_PAGE_UI.EMPTY
            : SEARCH_SYNONYMS_ADMIN_PAGE_UI.EMPTY_FILTER}
        </Text>
      }
      renderItem={({ item }) => {
        const isEditing = editingId === item._id;
        const isPending = pendingId === item._id;

        return (
          <View style={styles.row}>
            {isEditing ? (
              <>
                <TextInput style={styles.input} value={editToken} onChangeText={setEditToken} />
                <SynonymCategoryPicker
                  selected={editCategories}
                  onChange={setEditCategories}
                  disabled={isPending}
                />
                <View style={styles.actions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => void handleSaveEdit(item._id)}
                    disabled={isPending}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_BUTTON}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.ghostButton} onPress={cancelEdit} disabled={isPending}>
                    <Text>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.CANCEL_BUTTON}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.token}>
                  {SEARCH_SYNONYMS_ADMIN_PAGE_UI.TOKEN_LABEL}: {item.token}
                </Text>
                <Text style={styles.meta}>
                  {SEARCH_SYNONYMS_ADMIN_PAGE_UI.CATEGORIES_LABEL}:{" "}
                  {(item.categories ?? []).join(", ") || "—"}
                </Text>
                <View style={styles.actions}>
                  <Pressable style={styles.secondaryButton} onPress={() => startEdit(item)}>
                    <Text style={styles.secondaryButtonText}>
                      {SEARCH_SYNONYMS_ADMIN_PAGE_UI.EDIT_BUTTON}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item._id)}
                    disabled={isPending}
                  >
                    <Text style={styles.deleteText}>
                      {isPending
                        ? SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_PENDING
                        : SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        );
      }}
    />
  );
};
