import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import type { ProductCategoryAdminRow } from "@/entities/product-category-tree/model/adminTypes";
import { useProductCategoriesAdminQuery } from "@/entities/product-category-tree/model/useProductCategoriesAdminQuery";
import { useProductCategoryAdminMutations } from "@/entities/product-category-tree/model/useProductCategoryAdminMutations";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "@/entities/product/lib/productCategoryLabels";
import {
  filterCategoryRows,
  findAnyLeafForReassign,
  formatCategoryLegacyDetachLabel,
  formatCategoryPath,
  isCategoryStructureChanged,
  isValidCategorySlug,
  parseKeywordsCsv,
  sortCategoryRows,
} from "@/features/category-tree-admin-page/lib/categoryTreeAdminUtils";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "@/shared/config";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type EditDraft = Record<string, string | boolean>;

export const CategoryTreeAdminPage = () => {
  const categoriesQuery = useProductCategoriesAdminQuery();
  const { createMutation, patchMutation, deleteMutation } = useProductCategoryAdminMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({});
  const [newSlug, setNewSlug] = useState("");
  const [newLabelRu, setNewLabelRu] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [newIsLeaf, setNewIsLeaf] = useState(false);
  const [newKeywordsCsv, setNewKeywordsCsv] = useState("");
  const [newLegacySlug, setNewLegacySlug] = useState("");
  const [actionError, setActionError] = useState("");

  const rows = useMemo(
    () => sortCategoryRows(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const parentOptions = useMemo(
    () =>
      rows
        .filter((row) => row.isLeaf !== true)
        .map((row) => ({ id: row._id, label: formatCategoryPath(row) })),
    [rows],
  );
  const filteredRows = useMemo(
    () => filterCategoryRows(rows, searchQuery),
    [rows, searchQuery],
  );

  const patchDraft = (patch: EditDraft) => {
    setEditDraft((prev) => ({ ...prev, ...patch }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const startEdit = (row: ProductCategoryAdminRow) => {
    setEditingId(row._id);
    setEditDraft({
      slug: row.slug,
      labelRu: row.labelRu,
      parentId: row.parentId ?? "",
      isLeaf: row.isLeaf,
      keywordsCsv: (row.searchKeywords ?? []).join(", "),
      legacyProductCategory: row.legacyProductCategory ?? "",
    });
    setActionError("");
  };

  const handleCreate = async () => {
    const slug = newSlug.trim().toLowerCase();
    if (!isValidCategorySlug(slug)) {
      setActionError(CATEGORY_TREE_ADMIN_PAGE_UI.SLUG_INVALID);
      return;
    }
    setPendingId("create");
    setActionError("");
    try {
      await createMutation.mutateAsync({
        slug,
        labelRu: newLabelRu.trim(),
        parentId: newParentId.trim() || null,
        isLeaf: newParentId.trim() ? newIsLeaf : false,
        searchKeywords: newParentId.trim() ? parseKeywordsCsv(newKeywordsCsv) : [],
        legacyProductCategory: newParentId.trim() ? newLegacySlug.trim() || null : null,
      });
      setNewSlug("");
      setNewLabelRu("");
      setNewParentId("");
      setNewIsLeaf(false);
      setNewKeywordsCsv("");
      setNewLegacySlug("");
      setIsCreateOpen(false);
      await categoriesQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleSaveEdit = async (row: ProductCategoryAdminRow) => {
    const categoryId = row._id;
    setPendingId(categoryId);
    setActionError("");
    try {
      await patchMutation.mutateAsync({
        categoryId,
        body: {
          slug: String(editDraft.slug ?? "").trim(),
          labelRu: String(editDraft.labelRu ?? "").trim(),
          parentId: String(editDraft.parentId ?? "").trim() || null,
          isLeaf: editDraft.isLeaf === true,
          searchKeywords: parseKeywordsCsv(String(editDraft.keywordsCsv ?? "")),
          legacyProductCategory: String(editDraft.legacyProductCategory ?? "").trim() || null,
        },
      });

      if (isCategoryStructureChanged(row, editDraft)) {
        await categoriesQuery.refetch();
      }
      cancelEdit();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    } finally {
      setPendingId(null);
    }
  };

  const runDelete = async (
    row: ProductCategoryAdminRow,
    options: { reassignProductCategoryId?: string; detachProducts?: boolean } = {},
  ) => {
    setPendingId(row._id);
    setActionError("");
    try {
      await deleteMutation.mutateAsync({ categoryId: row._id, options });
      if (editingId === row._id) {
        cancelEdit();
      }
      await categoriesQuery.refetch();
    } catch (error) {
      throw error;
    } finally {
      setPendingId(null);
    }
  };

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

  if (categoriesQuery.isPending && rows.length === 0) {
    return <ScreenLoadingState message={CATEGORY_TREE_ADMIN_PAGE_UI.LOADING} />;
  }

  if (categoriesQuery.isError && rows.length === 0) {
    return (
      <ScreenErrorState
        message={
          categoriesQuery.error instanceof Error
            ? categoriesQuery.error.message
            : CATEGORY_TREE_ADMIN_PAGE_UI.LOAD_ERROR
        }
        onRetry={() => void categoriesQuery.refetch()}
      />
    );
  }

  const isCreateRoot = !newParentId.trim();

  return (
    <FlatList
      data={filteredRows}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={categoriesQuery.isFetching}
          onRefresh={() => void categoriesQuery.refetch()}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            style={styles.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
          />
          <Pressable style={styles.toggleCreate} onPress={() => setIsCreateOpen((open) => !open)}>
            <Text style={styles.toggleCreateText}>{CATEGORY_TREE_ADMIN_PAGE_UI.ADD_CREATE}</Text>
          </Pressable>
          {isCreateOpen ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>{CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_HEADING}</Text>
              <Text style={styles.label}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_SLUG}</Text>
              <TextInput style={styles.input} value={newSlug} onChangeText={setNewSlug} />
              <Text style={styles.hint}>{CATEGORY_TREE_ADMIN_PAGE_UI.SLUG_HINT}</Text>
              <Text style={styles.label}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_NAME}</Text>
              <TextInput style={styles.input} value={newLabelRu} onChangeText={setNewLabelRu} />
              <Text style={styles.label}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_PARENT}</Text>
              <ParentPicker
                value={newParentId}
                options={parentOptions}
                onChange={setNewParentId}
              />
              {!isCreateRoot ? (
                <>
                  <View style={styles.switchRow}>
                    <Text>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</Text>
                    <Switch value={newIsLeaf} onValueChange={setNewIsLeaf} />
                  </View>
                  <Text style={styles.label}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_KEYWORDS}</Text>
                  <TextInput
                    style={styles.input}
                    value={newKeywordsCsv}
                    onChangeText={setNewKeywordsCsv}
                    placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.KEYWORDS_PLACEHOLDER}
                  />
                  <LegacyPicker value={newLegacySlug} onChange={setNewLegacySlug} />
                </>
              ) : null}
              <Pressable
                style={[styles.primaryButton, pendingId === "create" && styles.disabled]}
                onPress={() => void handleCreate()}
                disabled={pendingId === "create"}
              >
                <Text style={styles.primaryButtonText}>
                  {CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_BUTTON}
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
            ? CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY
            : CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY_FILTER}
        </Text>
      }
      renderItem={({ item }) => {
        const isEditing = editingId === item._id;
        const isPending = pendingId === item._id;

        return (
          <View style={styles.row}>
            <Text style={styles.path}>{formatCategoryPath(item)}</Text>
            <Text style={styles.badge}>
              {item.isLeaf
                ? CATEGORY_TREE_ADMIN_PAGE_UI.LEAF_BADGE
                : CATEGORY_TREE_ADMIN_PAGE_UI.BRANCH_BADGE}
            </Text>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={String(editDraft.slug ?? "")}
                  onChangeText={(value) => patchDraft({ slug: value })}
                />
                <TextInput
                  style={styles.input}
                  value={String(editDraft.labelRu ?? "")}
                  onChangeText={(value) => patchDraft({ labelRu: value })}
                />
                <ParentPicker
                  value={String(editDraft.parentId ?? "")}
                  options={parentOptions.filter((opt) => opt.id !== item._id)}
                  onChange={(value) => patchDraft({ parentId: value })}
                />
                <View style={styles.switchRow}>
                  <Text>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</Text>
                  <Switch
                    value={editDraft.isLeaf === true}
                    onValueChange={(value) => patchDraft({ isLeaf: value })}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={String(editDraft.keywordsCsv ?? "")}
                  onChangeText={(value) => patchDraft({ keywordsCsv: value })}
                />
                <LegacyPicker
                  value={String(editDraft.legacyProductCategory ?? "")}
                  onChange={(value) => patchDraft({ legacyProductCategory: value })}
                />
                <View style={styles.actions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => void handleSaveEdit(item)}
                    disabled={isPending}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_BUTTON}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.ghostButton} onPress={cancelEdit} disabled={isPending}>
                    <Text>{CATEGORY_TREE_ADMIN_PAGE_UI.CANCEL_BUTTON}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.actions}>
                <Pressable style={styles.secondaryButton} onPress={() => startEdit(item)}>
                  <Text style={styles.secondaryButtonText}>
                    {CATEGORY_TREE_ADMIN_PAGE_UI.EDIT_BUTTON}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                  disabled={isPending}
                >
                  <Text style={styles.deleteText}>
                    {CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      }}
    />
  );
};

type ParentPickerProps = {
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
};

const ParentPicker = ({ value, options, onChange }: ParentPickerProps) => (
  <View style={styles.pickerWrap}>
    <Pressable
      style={[styles.pickerChip, value === "" && styles.pickerChipSelected]}
      onPress={() => onChange("")}
    >
      <Text style={styles.pickerChipText}>{CATEGORY_TREE_ADMIN_PAGE_UI.PARENT_ROOT}</Text>
    </Pressable>
    {options.map((option) => (
      <Pressable
        key={option.id}
        style={[styles.pickerChip, value === option.id && styles.pickerChipSelected]}
        onPress={() => onChange(option.id)}
      >
        <Text style={styles.pickerChipText} numberOfLines={1}>
          {option.label}
        </Text>
      </Pressable>
    ))}
  </View>
);

type LegacyPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

const LegacyPicker = ({ value, onChange }: LegacyPickerProps) => (
  <View style={styles.pickerWrap}>
    <Pressable
      style={[styles.pickerChip, value === "" && styles.pickerChipSelected]}
      onPress={() => onChange("")}
    >
      <Text style={styles.pickerChipText}>{CATEGORY_TREE_ADMIN_PAGE_UI.LEGACY_NONE}</Text>
    </Pressable>
    {PRODUCT_CATEGORIES.map((slug) => (
      <Pressable
        key={slug}
        style={[styles.pickerChip, value === slug && styles.pickerChipSelected]}
        onPress={() => onChange(slug)}
      >
        <Text style={styles.pickerChipText}>{PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: { padding: 12, gap: 12, paddingBottom: 32 },
  header: { gap: 10, marginBottom: 8 },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  toggleCreate: { alignSelf: "flex-start" },
  toggleCreateText: { color: "#1f6feb", fontWeight: "600" },
  panel: { gap: 8, padding: 12, backgroundColor: "#f8f8f8", borderRadius: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: "#444" },
  hint: { fontSize: 11, color: "#888" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  row: { gap: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  path: { fontSize: 15, fontWeight: "600" },
  badge: { fontSize: 11, color: "#666" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pickerChip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: "100%",
  },
  pickerChipSelected: { borderColor: "#1f6feb", backgroundColor: "#e8f1ff" },
  pickerChipText: { fontSize: 11, color: "#333" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  primaryButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryButtonText: { fontWeight: "600" },
  ghostButton: { paddingVertical: 8, paddingHorizontal: 8 },
  deleteButton: {
    backgroundColor: "#c62828",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.5 },
  error: { color: "#c62828", fontSize: 13 },
  empty: { textAlign: "center", color: "#666", padding: 24 },
});
