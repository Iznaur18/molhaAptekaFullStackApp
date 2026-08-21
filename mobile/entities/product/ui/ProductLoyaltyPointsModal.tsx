import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveSellerMaxLoyaltyPointsPerUnit";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useMyProductsInfiniteQuery } from "@/entities/product/model/useMyProductsInfiniteQuery";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductLoyaltyPointsModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

const LOYALTY_POINTS_MAX_LENGTH = 8;

export const ProductLoyaltyPointsModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductLoyaltyPointsModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();
  const loyaltyStatusQuery = useMyLoyaltyPointsStatusQuery(visible);
  const sellerProductsQuery = useMyProductsInfiniteQuery({ enabled: visible });

  const [points, setPoints] = useState("0");
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  useEffect(() => {
    if (!visible || !sellerProductsQuery.hasNextPage || sellerProductsQuery.isFetchingNextPage) {
      return;
    }
    void sellerProductsQuery.fetchNextPage();
  }, [
    sellerProductsQuery.data,
    sellerProductsQuery.fetchNextPage,
    sellerProductsQuery.hasNextPage,
    sellerProductsQuery.isFetchingNextPage,
    visible,
  ]);

  const budget = useMemo(
    () =>
      resolveSellerMaxLoyaltyPointsPerUnit({
        loyaltyPointsBalance: loyaltyStatusQuery.data?.loyaltyPointsBalance ?? 0,
        loyaltyPointsReserved: loyaltyStatusQuery.data?.loyaltyPointsReserved ?? 0,
        sellerProducts: sellerProductsQuery.products,
        editingProductId: productId || null,
      }),
    [
      loyaltyStatusQuery.data?.loyaltyPointsBalance,
      loyaltyStatusQuery.data?.loyaltyPointsReserved,
      productId,
      sellerProductsQuery.products,
    ],
  );

  const fieldDisabled = budget.maxPerUnit <= 0;

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setPoints(String(resolveProductLoyaltyPointsPerUnit(product)));
  }, [product, visible]);

  const handleSave = async () => {
    setError("");
    const nextPoints = Math.floor(Number(points));
    if (!Number.isFinite(nextPoints) || nextPoints < 0) {
      setError(CREATE_PRODUCT_UI.LOYALTY_MODAL_ERROR_REQUIRED);
      return;
    }
    if (nextPoints > budget.maxPerUnit) {
      setError(
        CREATE_PRODUCT_UI.ERROR_LOYALTY_POINTS_MAX(
          budget.maxPerUnit,
          budget.catalogCommitted,
        ),
      );
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: { loyaltyPointsPerUnit: nextPoints },
      });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.LOYALTY_MODAL_ERROR_REQUIRED,
      );
    }
  };

  if (!visible) {
    return null;
  }

  const sheet = (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={[styles.header, { paddingTop: headerInsetTop }]}>
          <Text style={styles.title}>{CREATE_PRODUCT_UI.LOYALTY_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.LOYALTY_MODAL_CLOSE}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>
              {CREATE_PRODUCT_UI.LOYALTY_MODAL_POINTS_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              value={points}
              keyboardType="number-pad"
              editable={!isSubmitting && !fieldDisabled}
              maxLength={LOYALTY_POINTS_MAX_LENGTH}
              onChangeText={(text) => {
                const digits = keepDigitsOnly(text);
                setPoints(digits.replace(/^0+(?=\d)/, ""));
              }}
            />
          </View>

          <Text style={styles.info}>
            {fieldDisabled
              ? CREATE_PRODUCT_UI.HINT_LOYALTY_POINTS_ZERO_BALANCE
              : CREATE_PRODUCT_UI.HINT_LOYALTY_POINTS_PER_UNIT(
                  budget.available,
                  budget.catalogCommitted,
                  budget.maxPerUnit,
                )}
          </Text>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerInsetBottom }]}>
          <Pressable
            style={[styles.saveButton, (isSubmitting || !productId) && styles.buttonDisabled]}
            accessibilityRole="button"
            disabled={isSubmitting || !productId}
            onPress={() => void handleSave()}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.saveButtonText}>{CREATE_PRODUCT_UI.LOYALTY_MODAL_SAVE}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embeddedRoot} pointerEvents="box-none">
        {sheet}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "none" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      {sheet}
    </Modal>
  );
};
