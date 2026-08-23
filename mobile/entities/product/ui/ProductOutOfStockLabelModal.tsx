import {
  PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON,
  PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK,
  normalizeProductOutOfStockLabel,
} from "@molha/api-contract";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type OutOfStockLabelValue =
  | typeof PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK
  | typeof PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON;

type ProductOutOfStockLabelModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  embedded?: boolean;
};

const LABEL_OPTIONS: Array<{ value: OutOfStockLabelValue; label: string }> = [
  {
    value: PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK,
    label: CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_OPTION_OUT_OF_STOCK,
  },
  {
    value: PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON,
    label: CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_OPTION_COMING_SOON,
  },
];

export const ProductOutOfStockLabelModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductOutOfStockLabelModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();

  const [selectedLabel, setSelectedLabel] = useState<OutOfStockLabelValue>(
    PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK,
  );
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setSelectedLabel(normalizeProductOutOfStockLabel(product.productOutOfStockLabel));
  }, [product, visible]);

  const handleSave = async () => {
    setError("");
    if (!productId) {
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: { productOutOfStockLabel: selectedLabel },
      });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_MODAL_PENDING,
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
          <Text style={styles.title}>{CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_MODAL_CLOSE}
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
          <Text style={styles.info}>{CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_MODAL_HINT}</Text>
          <Text style={styles.fieldLabel}>{CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_MODAL_TITLE}</Text>
          <View
            style={[
              localStyles.unitTrack,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {LABEL_OPTIONS.map((option) => {
              const selected = selectedLabel === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled: isSubmitting }}
                  disabled={isSubmitting}
                  onPress={() => setSelectedLabel(option.value)}
                  style={[
                    localStyles.unitOption,
                    selected && [
                      localStyles.unitOptionActive,
                      {
                        backgroundColor: theme.colors.surfaceElevated,
                        borderColor: theme.colors.action,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      localStyles.unitTitle,
                      {
                        color: selected ? theme.colors.text : theme.colors.textSecondary,
                      },
                      selected && localStyles.unitTitleActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
              <Text style={styles.saveButtonText}>
                {CREATE_PRODUCT_UI.OUT_OF_STOCK_LABEL_MODAL_SAVE}
              </Text>
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
      animationType={Platform.OS === "ios" ? "slide" : "fade"}
      transparent
      onRequestClose={onClose}
    >
      {sheet}
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  unitTrack: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  unitOptionActive: {
    borderWidth: 1,
  },
  unitTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  unitTitleActive: {
    fontWeight: "700",
  },
});
