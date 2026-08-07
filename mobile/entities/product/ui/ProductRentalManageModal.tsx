import {
  isProductRentalConfigured,
  PRODUCT_RENTAL_PRICE_UNIT_DAY,
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
} from "@izibuy/shared-lib";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductRentalManageModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  embedded?: boolean;
};

export const ProductRentalManageModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductRentalManageModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();

  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<string>(PRODUCT_RENTAL_PRICE_UNIT_DAY);
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setPrice(
      product.productRentalPriceRub != null
        ? formatIntegerGroupRu(product.productRentalPriceRub)
        : "",
    );
    setUnit(
      product.productRentalPriceUnit === PRODUCT_RENTAL_PRICE_UNIT_HOUR
        ? PRODUCT_RENTAL_PRICE_UNIT_HOUR
        : PRODUCT_RENTAL_PRICE_UNIT_DAY,
    );
  }, [product, visible]);

  const handleSave = async () => {
    setError("");
    const nextPrice = parseRubPriceInput(price);
    if (nextPrice == null || nextPrice < 1) {
      setError(CREATE_PRODUCT_UI.RENTAL_MODAL_ERROR_REQUIRED);
      return;
    }
    if (
      !isProductRentalConfigured({
        productRentalPriceRub: nextPrice,
        productRentalPriceUnit: unit,
      })
    ) {
      setError(CREATE_PRODUCT_UI.RENTAL_MODAL_ERROR_REQUIRED);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productRentalPriceRub: nextPrice,
          productRentalPriceUnit: unit,
        },
      });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.RENTAL_MODAL_ERROR_REQUIRED,
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
          <Text style={styles.title}>{CREATE_PRODUCT_UI.RENTAL_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.RENTAL_MODAL_CLOSE}
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
          <Text style={styles.info}>{CREATE_PRODUCT_UI.RENTAL_MODAL_HINT}</Text>

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>{CREATE_PRODUCT_UI.RENTAL_MODAL_PRICE_LABEL}</Text>
            <TextInput
              style={styles.input}
              value={price}
              keyboardType="number-pad"
              editable={!isSubmitting}
              onChangeText={(text) => setPrice(formatRubPriceInput(text))}
            />
          </View>

          <Text style={styles.fieldLabel}>{CREATE_PRODUCT_UI.RENTAL_MODAL_UNIT_LABEL}</Text>
          <View
            style={[
              localStyles.unitTrack,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                checked: unit === PRODUCT_RENTAL_PRICE_UNIT_DAY,
                disabled: isSubmitting,
              }}
              disabled={isSubmitting}
              onPress={() => setUnit(PRODUCT_RENTAL_PRICE_UNIT_DAY)}
              style={[
                localStyles.unitOption,
                unit === PRODUCT_RENTAL_PRICE_UNIT_DAY && [
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
                    color:
                      unit === PRODUCT_RENTAL_PRICE_UNIT_DAY
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                  },
                  unit === PRODUCT_RENTAL_PRICE_UNIT_DAY && localStyles.unitTitleActive,
                ]}
              >
                {CREATE_PRODUCT_UI.RENTAL_MODAL_UNIT_DAY}
              </Text>
              <Text style={[localStyles.unitHint, { color: theme.colors.textSecondary }]}>
                {CREATE_PRODUCT_UI.RENTAL_MODAL_UNIT_DAY_HINT}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                checked: unit === PRODUCT_RENTAL_PRICE_UNIT_HOUR,
                disabled: isSubmitting,
              }}
              disabled={isSubmitting}
              onPress={() => setUnit(PRODUCT_RENTAL_PRICE_UNIT_HOUR)}
              style={[
                localStyles.unitOption,
                unit === PRODUCT_RENTAL_PRICE_UNIT_HOUR && [
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
                    color:
                      unit === PRODUCT_RENTAL_PRICE_UNIT_HOUR
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                  },
                  unit === PRODUCT_RENTAL_PRICE_UNIT_HOUR && localStyles.unitTitleActive,
                ]}
              >
                {CREATE_PRODUCT_UI.RENTAL_MODAL_UNIT_HOUR}
              </Text>
              <Text style={[localStyles.unitHint, { color: theme.colors.textSecondary }]}>
                {CREATE_PRODUCT_UI.RENTAL_MODAL_UNIT_HOUR_HINT}
              </Text>
            </Pressable>
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
              <Text style={styles.saveButtonText}>{CREATE_PRODUCT_UI.RENTAL_MODAL_SAVE}</Text>
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
  },
  unitTitleActive: {
    fontWeight: "700",
  },
  unitHint: {
    fontSize: 12,
    fontWeight: "500",
  },
});
