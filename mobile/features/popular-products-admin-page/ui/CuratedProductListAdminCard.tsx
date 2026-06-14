import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { CuratedListAdminRow } from "@/entities/curated-product-list/api/curatedProductListAdminApi";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";

type CuratedProductListAdminCardProps = {
  list: CuratedListAdminRow;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDeleteList: () => void;
  onSaveTitle: (title: string) => Promise<void>;
  onAddProduct: (productId: string) => Promise<void>;
  onRemoveProduct: (productId: string) => Promise<void>;
};

export const CuratedProductListAdminCard = ({
  list,
  isFirst,
  isLast,
  isBusy,
  onMoveUp,
  onMoveDown,
  onDeleteList,
  onSaveTitle,
  onAddProduct,
  onRemoveProduct,
}: CuratedProductListAdminCardProps) => {
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [productIdDraft, setProductIdDraft] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSaveTitle = useCallback(async () => {
    setLocalError("");
    try {
      await onSaveTitle(titleDraft);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    }
  }, [onSaveTitle, titleDraft]);

  const handleAddProduct = useCallback(async () => {
    setLocalError("");
    const productId = productIdDraft.trim();
    if (!productId) {
      setLocalError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_REQUIRED);
      return;
    }
    try {
      await onAddProduct(productId);
      setProductIdDraft("");
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_ITEM_ERROR,
      );
    }
  }, [onAddProduct, productIdDraft]);

  const handleRemoveProduct = useCallback(
    async (productId: string) => {
      setLocalError("");
      try {
        await onRemoveProduct(productId);
      } catch (error) {
        setLocalError(
          error instanceof Error ? error.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.REMOVE_ITEM_ERROR,
        );
      }
    },
    [onRemoveProduct],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orderRow}>
          <Pressable style={styles.orderButton} onPress={onMoveUp} disabled={isBusy || isFirst}>
            <Text>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.MOVE_UP}</Text>
          </Pressable>
          <Pressable style={styles.orderButton} onPress={onMoveDown} disabled={isBusy || isLast}>
            <Text>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.MOVE_DOWN}</Text>
          </Pressable>
        </View>
        <Pressable style={styles.deleteListButton} onPress={onDeleteList} disabled={isBusy}>
          <Text style={styles.deleteListText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_TITLE_LABEL}</Text>
      <TextInput
        style={styles.input}
        value={titleDraft}
        maxLength={60}
        onChangeText={setTitleDraft}
        editable={!isBusy}
      />
      <Pressable style={styles.secondaryButton} onPress={() => void handleSaveTitle()} disabled={isBusy}>
        <Text style={styles.secondaryButtonText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.SAVE_TITLE}</Text>
      </Pressable>

      <Text style={styles.label}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_LABEL}</Text>
      <TextInput
        style={styles.input}
        value={productIdDraft}
        onChangeText={setProductIdDraft}
        placeholder={POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_PLACEHOLDER}
        editable={!isBusy}
      />
      <Pressable style={styles.primaryButton} onPress={() => void handleAddProduct()} disabled={isBusy}>
        <Text style={styles.primaryButtonText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_PRODUCT}</Text>
      </Pressable>

      {list.productIds.length === 0 ? (
        <Text style={styles.emptyList}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.EMPTY_LIST}</Text>
      ) : (
        list.productIds.map((productId) => (
          <View key={productId} style={styles.productRow}>
            <Text style={styles.productId}>{productId}</Text>
            <Pressable onPress={() => void handleRemoveProduct(productId)} disabled={isBusy}>
              <Text style={styles.removeText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.REMOVE_PRODUCT}</Text>
            </Pressable>
          </View>
        ))
      )}

      {localError ? <Text style={styles.error}>{localError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderRow: { flexDirection: "row", gap: 8 },
  orderButton: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteListButton: {
    backgroundColor: "#c62828",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteListText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  label: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
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
    alignItems: "center",
  },
  secondaryButtonText: { fontWeight: "600" },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  productId: { fontSize: 12, color: "#333", flex: 1, marginRight: 8 },
  removeText: { color: "#c62828", fontSize: 12, fontWeight: "600" },
  emptyList: { fontSize: 13, color: "#888", fontStyle: "italic" },
  error: { color: "#c62828", fontSize: 13 },
});
