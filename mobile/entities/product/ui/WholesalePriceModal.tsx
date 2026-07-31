import {
  isProductWholesaleConfigured,
  PRODUCT_WHOLESALE_MIN_QTY_MIN,
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
import { formatPriceRub } from "@/shared/lib";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type WholesalePriceModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

export const WholesalePriceModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: WholesalePriceModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();

  const [minQty, setMinQty] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const retailPrice = Math.floor(Number(product?.productPrice) || 0);
  const isSubmitting = patchMutation.isPending;

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setMinQty(
      product.productWholesaleMinQty != null
        ? String(product.productWholesaleMinQty)
        : String(PRODUCT_WHOLESALE_MIN_QTY_MIN),
    );
    setPrice(
      product.productWholesalePrice != null
        ? formatIntegerGroupRu(product.productWholesalePrice)
        : "",
    );
  }, [product, visible]);

  const handleSave = async () => {
    setError("");
    const nextMinQty = Math.floor(Number(minQty));
    const nextPrice = parseRubPriceInput(price);

    if (!Number.isFinite(nextMinQty) || nextPrice == null) {
      setError(CREATE_PRODUCT_UI.WHOLESALE_MODAL_ERROR_REQUIRED);
      return;
    }
    if (nextMinQty < PRODUCT_WHOLESALE_MIN_QTY_MIN) {
      setError(CREATE_PRODUCT_UI.WHOLESALE_MODAL_ERROR_MIN_QTY);
      return;
    }
    if (
      !isProductWholesaleConfigured({
        productPrice: retailPrice,
        productWholesaleMinQty: nextMinQty,
        productWholesalePrice: nextPrice,
      })
    ) {
      setError(CREATE_PRODUCT_UI.WHOLESALE_MODAL_ERROR_PRICE);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productWholesaleMinQty: nextMinQty,
          productWholesalePrice: nextPrice,
        },
      });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.WHOLESALE_MODAL_ERROR_REQUIRED,
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
          <Text style={styles.title}>{CREATE_PRODUCT_UI.WHOLESALE_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.WHOLESALE_MODAL_CLOSE}
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
          <Text style={styles.info}>{CREATE_PRODUCT_UI.WHOLESALE_MODAL_HINT}</Text>
          {retailPrice > 0 ? (
            <Text style={styles.info}>
              Обычная цена:{" "}
              <Text style={styles.retailPrice}>{formatPriceRub(retailPrice)}</Text>
            </Text>
          ) : null}

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>{CREATE_PRODUCT_UI.WHOLESALE_MODAL_MIN_QTY_LABEL}</Text>
            <TextInput
              style={styles.input}
              value={minQty}
              keyboardType="number-pad"
              editable={!isSubmitting}
              onChangeText={setMinQty}
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>{CREATE_PRODUCT_UI.WHOLESALE_MODAL_PRICE_LABEL}</Text>
            <TextInput
              style={styles.input}
              value={price}
              keyboardType="number-pad"
              editable={!isSubmitting}
              onChangeText={(text) => setPrice(formatRubPriceInput(text))}
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
              <Text style={styles.saveButtonText}>{CREATE_PRODUCT_UI.WHOLESALE_MODAL_SAVE}</Text>
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
