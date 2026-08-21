import {
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
} from "@izibuy/shared-lib";
import { useEffect, useState } from "react";
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

import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductBuyNFreeModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

const THRESHOLD_MAX_LENGTH = 2;

export const ProductBuyNFreeModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductBuyNFreeModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();

  const [threshold, setThreshold] = useState(String(PRODUCT_BUY_N_FREE_THRESHOLD_MIN));
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setThreshold(
      product.productBuyNFreeThreshold != null
        ? String(product.productBuyNFreeThreshold)
        : String(PRODUCT_BUY_N_FREE_THRESHOLD_MIN),
    );
  }, [product, visible]);

  const handleSave = async () => {
    setError("");
    const nextThreshold = Math.floor(Number(threshold));
    if (
      !Number.isFinite(nextThreshold) ||
      nextThreshold < PRODUCT_BUY_N_FREE_THRESHOLD_MIN ||
      nextThreshold > PRODUCT_BUY_N_FREE_THRESHOLD_MAX
    ) {
      setError(CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_ERROR_REQUIRED);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productBuyNFreeThreshold: nextThreshold,
          productBuyNFreeEnabled: true,
        },
      });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_ERROR_REQUIRED,
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
          <Text style={styles.title}>{CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_CLOSE}
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
          <Text style={styles.info}>{CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_HINT}</Text>

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>
              {CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_THRESHOLD_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              value={threshold}
              keyboardType="number-pad"
              editable={!isSubmitting}
              maxLength={THRESHOLD_MAX_LENGTH}
              onChangeText={(text) => {
                setThreshold(keepDigitsOnly(text).replace(/^0+(?=\d)/, ""));
              }}
            />
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
                {CREATE_PRODUCT_UI.BUY_N_FREE_MODAL_SAVE}
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
      animationType={Platform.OS === "web" ? "none" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      {sheet}
    </Modal>
  );
};
