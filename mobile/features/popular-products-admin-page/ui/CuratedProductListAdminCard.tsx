import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import type { CuratedListAdminRow } from "@/entities/curated-product-list/api/curatedProductListAdminApi";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

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
  const styles = useAdminPanelStyles();
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
      <View style={styles.cardBody}>
        <View style={styles.curatedCardHeader}>
          <View style={styles.orderRow}>
            <Pressable
              style={[styles.orderButton, (isBusy || isFirst) && styles.orderButtonDisabled]}
              onPress={onMoveUp}
              disabled={isBusy || isFirst}
              accessibilityRole="button"
              accessibilityLabel={POPULAR_PRODUCTS_ADMIN_PAGE_UI.MOVE_UP_ARIA}
            >
              <Text style={styles.orderButtonText}>↑</Text>
            </Pressable>
            <Pressable
              style={[styles.orderButton, (isBusy || isLast) && styles.orderButtonDisabled]}
              onPress={onMoveDown}
              disabled={isBusy || isLast}
              accessibilityRole="button"
              accessibilityLabel={POPULAR_PRODUCTS_ADMIN_PAGE_UI.MOVE_DOWN_ARIA}
            >
              <Text style={styles.orderButtonText}>↓</Text>
            </Pressable>
          </View>
          <Pressable style={styles.dangerButton} onPress={onDeleteList} disabled={isBusy}>
            <Text style={styles.dangerButtonText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST}</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_TITLE_LABEL}</Text>
          <TextInput
            style={styles.fieldInput}
            value={titleDraft}
            maxLength={60}
            onChangeText={setTitleDraft}
            editable={!isBusy}
          />
        </View>
        <Pressable
          style={[styles.secondaryButton, (isBusy || titleDraft.trim() === "") && styles.primaryButtonDisabled]}
          onPress={() => void handleSaveTitle()}
          disabled={isBusy || titleDraft.trim() === ""}
        >
          <Text style={styles.secondaryButtonText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.SAVE_TITLE}</Text>
        </Pressable>

        <View style={styles.addProductRow}>
          <View style={[styles.field, styles.addProductField]}>
            <Text style={styles.fieldLabel}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_LABEL}</Text>
            <TextInput
              style={styles.fieldInput}
              value={productIdDraft}
              onChangeText={setProductIdDraft}
              placeholder={POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_PLACEHOLDER}
              editable={!isBusy}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Pressable
            style={[styles.primaryButton, isBusy && styles.primaryButtonDisabled]}
            onPress={() => void handleAddProduct()}
            disabled={isBusy}
          >
            <Text style={styles.primaryButtonText}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_PRODUCT}</Text>
          </Pressable>
        </View>

        {localError ? (
          <Text style={[styles.alert, styles.alertError]} accessibilityRole="alert">
            {localError}
          </Text>
        ) : null}

        {list.productIds.length === 0 ? (
          <Text style={styles.emptyList}>{POPULAR_PRODUCTS_ADMIN_PAGE_UI.EMPTY_LIST}</Text>
        ) : (
          <View style={styles.productItems}>
            {list.productIds.map((productId) => (
              <View key={productId} style={styles.productItemRow}>
                <Text style={styles.productIdText}>{productId}</Text>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => void handleRemoveProduct(productId)}
                  disabled={isBusy}
                >
                  <Text style={styles.secondaryButtonText}>
                    {POPULAR_PRODUCTS_ADMIN_PAGE_UI.REMOVE_PRODUCT}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
