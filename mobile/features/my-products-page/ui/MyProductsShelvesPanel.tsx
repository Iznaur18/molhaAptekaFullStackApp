import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

import { fetchMyProductsPage } from "@/entities/product/api/fetchMyProductsPage";
import {
  createSellerShelf,
  deleteSellerShelf,
  reorderSellerShelves,
  setSellerShelfProducts,
} from "@/entities/seller-shelf/api/sellerShelfApi";
import { sellerShelfQueryKeys } from "@/entities/seller-shelf/model/sellerShelfQueryKeys";
import { SELLER_SHELF_UI } from "@/shared/config";
import { MY_PRODUCTS_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

async function fetchAllMyProductsForShelves() {
  const all: Array<Record<string, unknown> & { _id: string }> = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await fetchMyProductsPage({ page, limit: 50 });
    all.push(...(result.products as Array<Record<string, unknown> & { _id: string }>));
    totalPages = result.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return all;
}

const useStyles = createThemedStyles((theme) => ({
  root: {
    gap: 0,
    paddingVertical: L.shelvesPaddingY,
    paddingHorizontal: L.shelvesPaddingX,
    borderRadius: L.shelvesRadius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.actionSurface,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: L.shelvesToggleGap,
  },
  toggleMain: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: L.shelvesToggleGap,
  },
  title: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
  hint: { fontSize: 13, color: theme.colors.textMuted },
  collapsedCount: { fontSize: 13, color: theme.colors.textMuted },
  toggleAction: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action,
  },
  body: { gap: 8 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.action,
  },
  btnText: { color: theme.colors.onContrast, fontWeight: "600" },
  ghostBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  ghostText: { color: theme.colors.action, fontWeight: "600" },
  item: {
    gap: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemName: { fontWeight: "600", color: theme.colors.text },
  muted: { color: theme.colors.textMuted, fontSize: 13 },
  modalCard: {
    flex: 1,
    marginTop: 48,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  checkRow: { flexDirection: "row", gap: 10, paddingVertical: 8, alignItems: "center" },
}));

export const MyProductsShelvesPanel = () => {
  const theme = useAppTheme();
  const styles = useStyles();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [assignShelfId, setAssignShelfId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const shelvesQuery = useQuery({
    queryKey: sellerShelfQueryKeys.mine(),
    queryFn: async () => {
      const { fetchMySellerShelves } = await import(
        "@/entities/seller-shelf/api/sellerShelfApi"
      );
      return fetchMySellerShelves();
    },
  });

  const shelves = shelvesQuery.data?.shelves ?? [];
  const assignShelf = useMemo(
    () => shelves.find((s) => s._id === assignShelfId) ?? null,
    [assignShelfId, shelves],
  );

  const productsQuery = useQuery({
    queryKey: [...sellerShelfQueryKeys.all, "assign-products"],
    queryFn: fetchAllMyProductsForShelves,
    enabled: Boolean(assignShelfId),
  });

  useEffect(() => {
    if (!assignShelfId || !productsQuery.data) return;
    const next = new Set<string>();
    for (const product of productsQuery.data) {
      if (String(product.sellerShelfId ?? "") === String(assignShelfId)) {
        next.add(String(product._id));
      }
    }
    setSelectedIds(next);
  }, [assignShelfId, productsQuery.data]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: sellerShelfQueryKeys.mine() });
  };

  const createMutation = useMutation({
    mutationFn: () => createSellerShelf(name.trim()),
    onSuccess: () => {
      setName("");
      invalidate();
    },
    onError: (error) => {
      Alert.alert("Ошибка", error instanceof Error ? error.message : "Ошибка");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSellerShelf,
    onSuccess: invalidate,
    onError: (error) => {
      Alert.alert("Ошибка", error instanceof Error ? error.message : "Ошибка");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderSellerShelves,
    onSuccess: invalidate,
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      setSellerShelfProducts(String(assignShelfId), [...selectedIds]),
    onSuccess: () => {
      setAssignShelfId(null);
      invalidate();
    },
    onError: (error) => {
      Alert.alert("Ошибка", error instanceof Error ? error.message : "Ошибка");
    },
  });

  const move = (shelfId: string, dir: -1 | 1) => {
    const index = shelves.findIndex((s) => s._id === shelfId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= shelves.length) return;
    const ordered = shelves.map((s) => s._id);
    const [item] = ordered.splice(index, 1);
    ordered.splice(target, 0, item);
    reorderMutation.mutate(ordered);
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={SELLER_SHELF_UI.EXPAND_TOGGLE(isExpanded)}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsExpanded((prev) => !prev);
        }}
      >
        <View style={styles.toggleMain}>
          <Text style={styles.title}>{SELLER_SHELF_UI.TITLE}</Text>
          {!isExpanded && shelves.length > 0 ? (
            <Text style={styles.collapsedCount}>
              {SELLER_SHELF_UI.COLLAPSED_COUNT(shelves.length)}
            </Text>
          ) : null}
        </View>
        <Text style={styles.toggleAction}>
          {SELLER_SHELF_UI.EXPAND_TOGGLE(isExpanded)}
        </Text>
      </Pressable>

      {isExpanded ? (
        <View style={styles.body}>
          <Text style={styles.hint}>{SELLER_SHELF_UI.HINT}</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={SELLER_SHELF_UI.CREATE_PLACEHOLDER}
              placeholderTextColor={theme.colors.textMuted}
              maxLength={30}
            />
            <Pressable
              style={styles.btn}
              disabled={!name.trim() || createMutation.isPending || shelves.length >= 10}
              onPress={() => createMutation.mutate()}
            >
              <Text style={styles.btnText}>{SELLER_SHELF_UI.CREATE}</Text>
            </Pressable>
          </View>
          {shelvesQuery.isLoading ? <ActivityIndicator /> : null}
          {shelves.length === 0 && !shelvesQuery.isLoading ? (
            <Text style={styles.muted}>{SELLER_SHELF_UI.EMPTY}</Text>
          ) : null}
          {shelves.map((shelf, index) => (
            <View key={shelf._id} style={styles.item}>
              <Text style={styles.itemName}>
                {shelf.name} · {shelf.productCount}
              </Text>
              <View style={styles.row}>
                <Pressable style={styles.ghostBtn} onPress={() => setAssignShelfId(shelf._id)}>
                  <Text style={styles.ghostText}>{SELLER_SHELF_UI.ASSIGN}</Text>
                </Pressable>
                <Pressable
                  style={styles.ghostBtn}
                  disabled={index === 0}
                  onPress={() => move(shelf._id, -1)}
                >
                  <Text style={styles.ghostText}>{SELLER_SHELF_UI.MOVE_UP}</Text>
                </Pressable>
                <Pressable
                  style={styles.ghostBtn}
                  disabled={index >= shelves.length - 1}
                  onPress={() => move(shelf._id, 1)}
                >
                  <Text style={styles.ghostText}>{SELLER_SHELF_UI.MOVE_DOWN}</Text>
                </Pressable>
                <Pressable
                  style={styles.ghostBtn}
                  onPress={() => {
                    Alert.alert(SELLER_SHELF_UI.DELETE, SELLER_SHELF_UI.DELETE_CONFIRM, [
                      { text: "Отмена", style: "cancel" },
                      {
                        text: SELLER_SHELF_UI.DELETE,
                        style: "destructive",
                        onPress: () => deleteMutation.mutate(shelf._id),
                      },
                    ]);
                  }}
                >
                  <Text style={[styles.ghostText, { color: theme.colors.danger }]}>
                    {SELLER_SHELF_UI.DELETE}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <Modal visible={Boolean(assignShelf)} animationType="slide" onRequestClose={() => setAssignShelfId(null)}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>
            {assignShelf ? SELLER_SHELF_UI.ASSIGN_TITLE(assignShelf.name) : ""}
          </Text>
          <ScrollView>
            {productsQuery.isLoading ? <ActivityIndicator /> : null}
            {(productsQuery.data ?? []).map((product) => {
              const id = String(product._id);
              const checked = selectedIds.has(id);
              return (
                <Pressable
                  key={id}
                  style={styles.checkRow}
                  onPress={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                >
                  <Text>{checked ? "☑" : "☐"}</Text>
                  <Text style={{ color: theme.colors.text, flex: 1 }}>
                    {String(product.productName ?? "").trim() || "Товар"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            style={styles.btn}
            disabled={assignMutation.isPending}
            onPress={() => assignMutation.mutate()}
          >
            <Text style={styles.btnText}>{SELLER_SHELF_UI.ASSIGN_SAVE}</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={() => setAssignShelfId(null)}>
            <Text style={styles.ghostText}>Закрыть</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};
