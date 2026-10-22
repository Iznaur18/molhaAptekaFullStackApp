import {
  PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT,
  PRODUCT_POINTS_PER_BUYER_LIMIT_MAX,
  PRODUCT_POINTS_PRICE_MAX,
  PRODUCT_POINTS_PRICE_MIN,
  isProductPointsSaleActive,
  normalizeProductPointsPerBuyerLimit,
} from "@molha/api-contract";
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
import { CheckboxBox } from "@/shared/ui/AppCheckbox";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductPointsSaleModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

const PRICE_MAX_LENGTH = String(PRODUCT_POINTS_PRICE_MAX).length;
const LIMIT_MAX_LENGTH = String(PRODUCT_POINTS_PER_BUYER_LIMIT_MAX).length;

/**
 * Продажа за баллы: цена в баллах, лимит в одни руки, включить / выключить.
 * Паритет web `ProductPointsSaleModal`: окно само сохраняет товар, тумблер в
 * управлении только открывает его.
 */
export const ProductPointsSaleModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductPointsSaleModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();

  const [price, setPrice] = useState("");
  const [limit, setLimit] = useState(String(PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT));
  const [noLimit, setNoLimit] = useState(false);
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;
  const isEnabled = isProductPointsSaleActive(product);

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setPrice(
      product.productPointsPrice != null ? String(product.productPointsPrice) : "",
    );
    const currentLimit = normalizeProductPointsPerBuyerLimit(
      product.productPointsPerBuyerLimit,
    );
    setNoLimit(currentLimit == null);
    setLimit(String(currentLimit ?? PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT));
  }, [product, visible]);

  const save = async (body: Record<string, unknown>) => {
    try {
      const updated = await patchMutation.mutateAsync({ productId, body });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.POINTS_SALE_MODAL_ERROR_PRICE,
      );
    }
  };

  const handleSave = async () => {
    setError("");
    const nextPrice = Math.floor(Number(price));
    if (
      !Number.isFinite(nextPrice) ||
      nextPrice < PRODUCT_POINTS_PRICE_MIN ||
      nextPrice > PRODUCT_POINTS_PRICE_MAX
    ) {
      setError(CREATE_PRODUCT_UI.POINTS_SALE_MODAL_ERROR_PRICE);
      return;
    }
    const nextLimit = noLimit ? null : Math.floor(Number(limit));
    if (
      nextLimit != null &&
      (!Number.isFinite(nextLimit) ||
        nextLimit < 1 ||
        nextLimit > PRODUCT_POINTS_PER_BUYER_LIMIT_MAX)
    ) {
      setError(CREATE_PRODUCT_UI.POINTS_SALE_MODAL_ERROR_LIMIT);
      return;
    }
    await save({
      productPointsSaleEnabled: true,
      productPointsPrice: nextPrice,
      productPointsPerBuyerLimit: nextLimit,
    });
  };

  if (!visible) {
    return null;
  }

  const actionsDisabled = isSubmitting || !productId;

  const sheet = (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={[styles.header, { paddingTop: headerInsetTop }]}>
          <Text style={styles.title}>{CREATE_PRODUCT_UI.POINTS_SALE_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.POINTS_SALE_MODAL_CLOSE}
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
          <Text style={styles.info}>{CREATE_PRODUCT_UI.POINTS_SALE_MODAL_HINT}</Text>

          <View style={styles.rowFields}>
            <View style={styles.rowField}>
              <Text style={styles.fieldLabel}>
                {CREATE_PRODUCT_UI.POINTS_SALE_MODAL_PRICE_LABEL}
              </Text>
              <TextInput
                style={styles.input}
                value={price}
                keyboardType="number-pad"
                editable={!isSubmitting}
                maxLength={PRICE_MAX_LENGTH}
                onChangeText={(text) => {
                  setPrice(keepDigitsOnly(text).replace(/^0+(?=\d)/, ""));
                }}
              />
            </View>
            <View style={styles.rowField}>
              <Text style={styles.fieldLabel}>
                {CREATE_PRODUCT_UI.POINTS_SALE_MODAL_LIMIT_LABEL}
              </Text>
              <TextInput
                style={styles.input}
                value={noLimit ? "" : limit}
                keyboardType="number-pad"
                editable={!isSubmitting && !noLimit}
                maxLength={LIMIT_MAX_LENGTH}
                onChangeText={(text) => {
                  setLimit(keepDigitsOnly(text).replace(/^0+(?=\d)/, ""));
                }}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: noLimit, disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={() => setNoLimit((prev) => !prev)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <CheckboxBox checked={noLimit} disabled={isSubmitting} />
            <Text style={styles.fieldLabel}>
              {CREATE_PRODUCT_UI.POINTS_SALE_MODAL_NO_LIMIT}
            </Text>
          </Pressable>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerInsetBottom, gap: 8 }]}>
          {isEnabled ? (
            <Pressable
              style={[styles.addPlanButton, actionsDisabled && styles.buttonDisabled]}
              accessibilityRole="button"
              disabled={actionsDisabled}
              onPress={() => {
                setError("");
                void save({ productPointsSaleEnabled: false });
              }}
            >
              <Text style={styles.addPlanButtonText}>
                {CREATE_PRODUCT_UI.POINTS_SALE_MODAL_DISABLE}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.saveButton, actionsDisabled && styles.buttonDisabled]}
            accessibilityRole="button"
            disabled={actionsDisabled}
            onPress={() => void handleSave()}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEnabled
                  ? CREATE_PRODUCT_UI.POINTS_SALE_MODAL_UPDATE
                  : CREATE_PRODUCT_UI.POINTS_SALE_MODAL_SAVE}
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
