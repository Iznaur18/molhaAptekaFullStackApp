import { PRODUCT_IMAGE_URLS_MAX, PRODUCT_NAME_MAX_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { computeProductDiscountPercent } from "@/entities/product/lib/computeProductDiscountPercent";
import {
  mapProductCharacteristicsToRows,
  type ProductCharacteristicRow,
  serializeProductCharacteristicRows,
} from "@/entities/product/lib/productCharacteristicRows";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveSellerMaxLoyaltyPointsPerUnit";
import { validateProductName } from "@/entities/product/lib/validateProductName";
import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useMyProductsInfiniteQuery } from "@/entities/product/model/useMyProductsInfiniteQuery";
import { ProductCharacteristicsEditor } from "@/entities/product/ui/ProductCharacteristicsEditor";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { CreateProductCategoryPicker } from "@/features/create-product/ui/CreateProductCategoryPicker";
import { ProductPhotoGrid } from "@/features/image-upload/ui/ProductPhotoGrid";
import { API_CLIENT_UI, CREATE_PRODUCT_UI, PRODUCT_REPORT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { confirmDestructiveAction } from "@/shared/lib/confirmDestructiveAction";
import {
  formatRubPriceInput,
  keepDigitsOnly,
  parseRubPriceInput,
} from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductEditorScreenStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
const PRODUCT_STOCK_QUANTITY_MIN = 1;
const PRODUCT_STOCK_QUANTITY_MAX = 9999;
const PRODUCT_PRICE_RUB_MAX = 999_999_999;
const LOYALTY_POINTS_MAX_LENGTH = 8;

const keepDigits = (value: string) => keepDigitsOnly(value);

type EditProductScreenProps = {
  productId: string;
};

const parseStockQuantity = (value: string): number | null => {
  const digits = keepDigitsOnly(value);
  if (!digits) {
    return null;
  }
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const EditProductScreen = ({ productId }: EditProductScreenProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductEditorScreenStyles();
  const productQuery = useCatalogProductQuery(productId);
  const { patchMutation, deleteMutation } = useMyProductMutations();
  const loyaltyPointsQuery = useMyLoyaltyPointsStatusQuery(Boolean(productId));
  const sellerProductsQuery = useMyProductsInfiniteQuery({ enabled: Boolean(productId) });

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOldPrice, setProductOldPrice] = useState("");
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const [productStockQuantity, setProductStockQuantity] = useState("1");
  const [loyaltyPointsPerUnit, setLoyaltyPointsPerUnit] = useState("0");
  const [productCategoryId, setProductCategoryId] = useState<string | null>(null);
  const [productCategoryLabel, setProductCategoryLabel] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [characteristicRows, setCharacteristicRows] = useState<ProductCharacteristicRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!productQuery.data || isInitialized) {
      return;
    }
    const product = productQuery.data as Record<string, unknown>;
    setProductName(String(product.productName ?? "").trim());
    setProductDescription(String(product.productDescription ?? "").trim());
    setProductPrice(formatRubPriceInput(product.productPrice ?? ""));
    const oldPrice = product.productOldPrice;
    setProductOldPrice(
      oldPrice != null && Number.isFinite(Number(oldPrice))
        ? formatRubPriceInput(Math.floor(Number(oldPrice)))
        : "",
    );
    setProductIsAvailable(product.productIsAvailable !== false);
    setProductStockQuantity(String(product.productStockQuantity ?? 1));
    setLoyaltyPointsPerUnit(String(resolveProductLoyaltyPointsPerUnit(product)));
    const categoryId = product.productCategoryId;
    if (typeof categoryId === "string" && categoryId.trim()) {
      setProductCategoryId(categoryId);
      setProductCategoryLabel(String(product.productCategoryLabelRu ?? categoryId));
    }
    setProductImageUrls(resolveProductImageUrls(product));
    setCharacteristicRows(mapProductCharacteristicsToRows(product.productCharacteristics));
    setIsInitialized(true);
  }, [isInitialized, productQuery.data]);

  useEffect(() => {
    if (!sellerProductsQuery.hasNextPage || sellerProductsQuery.isFetchingNextPage) {
      return;
    }
    void sellerProductsQuery.fetchNextPage();
  }, [
    sellerProductsQuery.data,
    sellerProductsQuery.fetchNextPage,
    sellerProductsQuery.hasNextPage,
    sellerProductsQuery.isFetchingNextPage,
  ]);

  const loyaltyBudget = useMemo(
    () =>
      resolveSellerMaxLoyaltyPointsPerUnit({
        loyaltyPointsBalance: loyaltyPointsQuery.data?.loyaltyPointsBalance ?? 0,
        loyaltyPointsReserved: loyaltyPointsQuery.data?.loyaltyPointsReserved ?? 0,
        sellerProducts: sellerProductsQuery.products,
        editingProductId: productId,
      }),
    [
      loyaltyPointsQuery.data?.loyaltyPointsBalance,
      loyaltyPointsQuery.data?.loyaltyPointsReserved,
      productId,
      sellerProductsQuery.products,
    ],
  );

  const loyaltyFieldDisabled = loyaltyBudget.maxPerUnit <= 0;

  const discountPercent = useMemo(() => {
    const price = parseRubPriceInput(productPrice);
    const oldPriceRaw = productOldPrice.trim();
    if (price == null || !oldPriceRaw) {
      return null;
    }
    const oldPrice = parseRubPriceInput(productOldPrice);
    return computeProductDiscountPercent(oldPrice, price);
  }, [productOldPrice, productPrice]);

  const validateForm = (): string | null => {
    const nameError = validateProductName(productName);
    if (nameError) {
      return nameError;
    }
    if (productDescription.trim().length < PRODUCT_DESCRIPTION_MIN_CHARS) {
      return CREATE_PRODUCT_UI.ERROR_DESCRIPTION;
    }
    const price = parseRubPriceInput(productPrice);
    if (price == null || price < 0) {
      return CREATE_PRODUCT_UI.ERROR_PRICE;
    }
    if (price > PRODUCT_PRICE_RUB_MAX) {
      return CREATE_PRODUCT_UI.ERROR_PRICE_MAX;
    }
    const oldPriceRaw = productOldPrice.trim();
    if (oldPriceRaw) {
      const oldPrice = parseRubPriceInput(productOldPrice);
      if (oldPrice == null || oldPrice <= price) {
        return CREATE_PRODUCT_UI.ERROR_OLD_PRICE;
      }
      if (oldPrice > PRODUCT_PRICE_RUB_MAX) {
        return CREATE_PRODUCT_UI.ERROR_PRICE_MAX;
      }
    }
    if (!productCategoryId) {
      return CREATE_PRODUCT_UI.ERROR_CATEGORY;
    }
    if (productImageUrls.length === 0) {
      return CREATE_PRODUCT_UI.ERROR_IMAGE_REQUIRED;
    }
    if (productIsAvailable) {
      const stock = parseStockQuantity(productStockQuantity);
      if (
        stock == null ||
        stock < PRODUCT_STOCK_QUANTITY_MIN ||
        stock > PRODUCT_STOCK_QUANTITY_MAX
      ) {
        return CREATE_PRODUCT_UI.ERROR_STOCK;
      }
    }
    const loyaltyParsed = Math.floor(Number(loyaltyPointsPerUnit));
    if (!Number.isFinite(loyaltyParsed) || loyaltyParsed < 0) {
      return CREATE_PRODUCT_UI.ERROR_LOYALTY_POINTS;
    }
    if (loyaltyParsed > loyaltyBudget.maxPerUnit) {
      return CREATE_PRODUCT_UI.ERROR_LOYALTY_POINTS_MAX(
        loyaltyBudget.maxPerUnit,
        loyaltyBudget.catalogCommitted,
      );
    }
    return null;
  };

  const isBusy = patchMutation.isPending || deleteMutation.isPending;

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const oldPriceRaw = productOldPrice.trim();
    const oldPrice = oldPriceRaw ? parseRubPriceInput(productOldPrice) : null;

    try {
      await patchMutation.mutateAsync({
        productId,
        body: {
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          productPrice: parseRubPriceInput(productPrice) ?? 0,
          productOldPrice: oldPriceRaw ? oldPrice : null,
          productCategoryId: productCategoryId ?? undefined,
          productIsAvailable,
          productStockQuantity: productIsAvailable
            ? (parseStockQuantity(productStockQuantity) ?? PRODUCT_STOCK_QUANTITY_MIN)
            : undefined,
          productImageUrls,
          productCharacteristics: serializeProductCharacteristicRows(characteristicRows),
          loyaltyPointsPerUnit: Math.floor(Number(loyaltyPointsPerUnit)) || 0,
        },
      });
      setSuccessMessage(CREATE_PRODUCT_UI.SAVED);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : CREATE_PRODUCT_UI.SAVE);
    }
  };

  const handleDelete = () => {
    confirmDestructiveAction({
      title: CREATE_PRODUCT_UI.DELETE,
      message: CREATE_PRODUCT_UI.DELETE_CONFIRM,
      confirmLabel: CREATE_PRODUCT_UI.DELETE,
      cancelLabel: PRODUCT_REPORT_UI.CANCEL,
      onConfirm: () => {
        void runDelete();
      },
    });
  };

  const runDelete = async () => {
    setErrorMessage("");
    try {
      await deleteMutation.mutateAsync(productId);
      router.replace("/hub/my-products");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : CREATE_PRODUCT_UI.DELETE);
    }
  };

  if (productQuery.isPending) {
    return <ScreenLoadingState />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productQuery.error,
          API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK,
        )}
        onRetry={() => productQuery.refetch()}
      />
    );
  }

  return (
    <View style={styles.editorScreen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, styles.contentWithFooterPad]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={[styles.zoneBlock, styles.zoneMain]}>
            <View style={styles.field}>
              <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_NAME}</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                maxLength={PRODUCT_NAME_MAX_LENGTH}
                editable={!isBusy}
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_DESCRIPTION}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={productDescription}
                onChangeText={setProductDescription}
                multiline
                editable={!isBusy}
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <ProductCharacteristicsEditor
              rows={characteristicRows}
              onChange={setCharacteristicRows}
              disabled={isBusy}
            />

            <Text style={styles.hint}>{CREATE_PRODUCT_UI.HINT_OLD_PRICE}</Text>

            <View style={styles.priceGrid}>
              <View style={[styles.field, styles.priceCol]}>
                <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_PRICE}</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={productPrice}
                  onChangeText={(text) => setProductPrice(formatRubPriceInput(text))}
                  keyboardType="number-pad"
                  editable={!isBusy}
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
              <View style={[styles.field, styles.priceCol]}>
                <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_OLD_PRICE}</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={productOldPrice}
                  onChangeText={(text) => setProductOldPrice(formatRubPriceInput(text))}
                  keyboardType="number-pad"
                  editable={!isBusy}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>

            {discountPercent != null ? (
              <View
                style={[styles.discountPreview, { backgroundColor: `${theme.colors.success}1f` }]}
              >
                <Text style={[styles.discountPreviewText, { color: theme.colors.success }]}>
                  {CREATE_PRODUCT_UI.DISCOUNT_PREVIEW(discountPercent)}
                </Text>
              </View>
            ) : null}

            <CreateProductCategoryPicker
              selectedCategoryId={productCategoryId}
              selectedCategoryLabel={productCategoryLabel}
              onSelect={(categoryId, label) => {
                setProductCategoryId(categoryId);
                setProductCategoryLabel(label);
              }}
            />
          </View>

          <View style={[styles.zoneBlock, styles.zoneInventory]}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{CREATE_PRODUCT_UI.LABEL_AVAILABLE}</Text>
              <Switch
                value={productIsAvailable}
                onValueChange={setProductIsAvailable}
                disabled={isBusy}
                trackColor={{ false: theme.colors.border, true: theme.colors.action }}
                thumbColor={theme.colors.surface}
              />
            </View>

            {productIsAvailable ? (
              <View style={styles.field}>
                <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_STOCK}</Text>
                <TextInput
                  style={styles.input}
                  value={productStockQuantity}
                  onChangeText={setProductStockQuantity}
                  keyboardType="number-pad"
                  editable={!isBusy}
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_LOYALTY_POINTS_PER_UNIT}</Text>
              <TextInput
                style={styles.input}
                value={loyaltyPointsPerUnit}
                onChangeText={(text) => setLoyaltyPointsPerUnit(keepDigits(text))}
                keyboardType="number-pad"
                editable={!isBusy && !loyaltyFieldDisabled}
                maxLength={LOYALTY_POINTS_MAX_LENGTH}
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
              />
              <Text style={styles.hint}>
                {loyaltyFieldDisabled
                  ? CREATE_PRODUCT_UI.HINT_LOYALTY_POINTS_ZERO_BALANCE
                  : CREATE_PRODUCT_UI.HINT_LOYALTY_POINTS_PER_UNIT(
                      loyaltyBudget.available,
                      loyaltyBudget.catalogCommitted,
                      loyaltyBudget.maxPerUnit,
                    )}
              </Text>
            </View>
          </View>

          <View style={[styles.zoneBlock, styles.zoneMedia]}>
            <View style={styles.field}>
              <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_IMAGE}</Text>
              <ProductPhotoGrid
                urls={productImageUrls}
                onChange={setProductImageUrls}
                maxCount={PRODUCT_IMAGE_URLS_MAX}
                disabled={isBusy}
              />
            </View>
          </View>

          {errorMessage ? (
            <View style={[styles.feedbackBox, styles.errorBox]} accessibilityRole="alert">
              <Text style={styles.error}>{errorMessage}</Text>
            </View>
          ) : null}
          {successMessage ? (
            <View style={[styles.feedbackBox, styles.successBox]}>
              <Text style={styles.success}>{successMessage}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footerDock}>
        <View style={styles.footer}>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
                isBusy && styles.disabled,
              ]}
              onPress={() => router.back()}
              disabled={isBusy}
            >
              <Text style={styles.cancelButtonText}>{CREATE_PRODUCT_UI.CANCEL}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isBusy && styles.buttonPressed,
                isBusy && styles.disabled,
              ]}
              onPress={() => {
                void handleSave();
              }}
              disabled={isBusy}
            >
              {patchMutation.isPending ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={styles.submitText}>{CREATE_PRODUCT_UI.SAVE}</Text>
              )}
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.buttonPressed,
              isBusy && styles.disabled,
            ]}
            onPress={handleDelete}
            disabled={isBusy}
          >
            <Text style={styles.deleteText}>{CREATE_PRODUCT_UI.DELETE}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
