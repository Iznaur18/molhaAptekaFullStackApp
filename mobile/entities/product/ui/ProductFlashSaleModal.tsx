import {
  PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES,
  PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES,
  PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT,
  resolveProductFlashSaleDurationMinutes,
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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { computeProductDiscountPercent } from "@/entities/product/lib/computeProductDiscountPercent";
import { resolveFlashSaleRestoreBasePrice } from "@/entities/product/lib/isProductFlashSaleActive";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { PRODUCT_FLASH_SALE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type DurationUnit = "minutes" | "hours" | "days";

const DURATION_UNITS: { value: DurationUnit; label: string }[] = [
  { value: "minutes", label: PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_MINUTES },
  { value: "hours", label: PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_HOURS },
  { value: "days", label: PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_DAYS },
];

const DEFAULT_DURATION_VALUE = "60";

type ProductFlashSaleModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

export const ProductFlashSaleModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductFlashSaleModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();

  const [salePrice, setSalePrice] = useState("");
  const [durationValue, setDurationValue] = useState(DEFAULT_DURATION_VALUE);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("minutes");
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isActive = product?.productFlashSaleEnabled === true;
  const isSubmitting = patchMutation.isPending;

  /**
   * Во время активной скидки `productPrice` — уже сниженная цена, поэтому базой
   * берём сохранённую `productFlashSaleBasePrice` (как делает сервер).
   */
  const basePrice = (() => {
    if (isActive) {
      const restoredBase = resolveFlashSaleRestoreBasePrice(product);
      if (restoredBase != null) {
        return restoredBase;
      }
    }
    return Math.floor(Number(product?.productPrice) || 0);
  })();

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    setSalePrice(
      isActive ? formatIntegerGroupRu(Math.floor(Number(product.productPrice) || 0)) : "",
    );
    const storedDurationMinutes = Math.floor(
      Number(product.productFlashSaleDurationMinutes),
    );
    if (isActive && Number.isFinite(storedDurationMinutes) && storedDurationMinutes > 0) {
      setDurationValue(String(storedDurationMinutes));
    } else {
      setDurationValue(DEFAULT_DURATION_VALUE);
    }
    setDurationUnit("minutes");
  }, [isActive, product, visible]);

  const handleSave = async () => {
    setError("");
    const nextSalePrice = parseRubPriceInput(salePrice);
    const durationMinutes = resolveProductFlashSaleDurationMinutes(
      durationValue,
      durationUnit,
    );

    if (nextSalePrice == null || durationMinutes == null) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_REQUIRED);
      return;
    }
    if (nextSalePrice >= basePrice) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_PRICE);
      return;
    }
    const discountPercent = computeProductDiscountPercent(basePrice, nextSalePrice);
    if (
      discountPercent == null ||
      discountPercent > PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT
    ) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_MAX_DISCOUNT);
      return;
    }
    if (
      durationMinutes < PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES ||
      durationMinutes > PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES
    ) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_REQUIRED);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productFlashSaleEnabled: true,
          productFlashSalePrice: nextSalePrice,
          productFlashSaleDurationValue: Math.floor(Number(durationValue)),
          productFlashSaleDurationUnit: durationUnit,
        },
      });
      // Досыпаем поля скидки поверх ответа: список «мои товары» иногда отдаёт
      // усечённый товар, и без этого карточка на кадр теряет отсчёт.
      onSaved?.({
        ...(product ?? {}),
        ...(updated as CatalogProduct),
        productFlashSaleEnabled: true,
        productFlashSaleBasePrice: basePrice,
        productFlashSaleDurationMinutes: durationMinutes,
        productPrice: nextSalePrice,
        productOldPrice: basePrice,
        productFlashSaleEndsAt:
          (updated as CatalogProduct)?.productFlashSaleEndsAt ??
          new Date(Date.now() + durationMinutes * 60_000).toISOString(),
      } as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : PRODUCT_FLASH_SALE_UI.MODAL_ERROR_REQUIRED,
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
          <Text style={styles.title}>{PRODUCT_FLASH_SALE_UI.MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_FLASH_SALE_UI.MODAL_CLOSE}
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
          <Text style={styles.info}>{PRODUCT_FLASH_SALE_UI.MODAL_HINT}</Text>
          {basePrice > 0 ? (
            <Text style={styles.info}>
              {PRODUCT_FLASH_SALE_UI.MODAL_BASE_PRICE_LABEL}:{" "}
              <Text style={styles.retailPrice}>{formatPriceRub(basePrice)}</Text>
            </Text>
          ) : null}

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>
              {PRODUCT_FLASH_SALE_UI.MODAL_SALE_PRICE_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              value={salePrice}
              keyboardType="number-pad"
              editable={!isSubmitting}
              onChangeText={(text) => setSalePrice(formatRubPriceInput(text))}
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>
              {PRODUCT_FLASH_SALE_UI.MODAL_DURATION_VALUE_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              value={durationValue}
              keyboardType="number-pad"
              editable={!isSubmitting}
              onChangeText={setDurationValue}
            />
          </View>

          <Text style={styles.fieldLabel}>
            {PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_LABEL}
          </Text>
          <View
            style={[
              localStyles.unitTrack,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {DURATION_UNITS.map((unit) => {
              const isSelected = durationUnit === unit.value;
              return (
                <Pressable
                  key={unit.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected, disabled: isSubmitting }}
                  accessibilityLabel={unit.label}
                  disabled={isSubmitting}
                  onPress={() => setDurationUnit(unit.value)}
                  style={[
                    localStyles.unitOption,
                    isSelected && [
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
                        color: isSelected
                          ? theme.colors.text
                          : theme.colors.textSecondary,
                      },
                      isSelected && localStyles.unitTitleActive,
                    ]}
                  >
                    {unit.label}
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
            style={[
              styles.saveButton,
              (isSubmitting || !productId) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            disabled={isSubmitting || !productId}
            onPress={() => void handleSave()}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isActive
                  ? PRODUCT_FLASH_SALE_UI.MODAL_SAVE_UPDATE
                  : PRODUCT_FLASH_SALE_UI.MODAL_SAVE}
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

/** Сегмент-контрол единиц — та же геометрия, что у выбора «сутки/час» в аренде. */
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
    minHeight: 44,
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
});
