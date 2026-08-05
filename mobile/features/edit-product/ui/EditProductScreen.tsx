import {
  DEFAULT_VIEWER_REGION_CODE,
  getRuRegionByCode,
  isRuRegionCode,
  PRODUCT_DESCRIPTION_MIN_CHARS,
  PRODUCT_IMAGE_URLS_MAX,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PRICE_RUB_MAX,
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
} from "@molha/api-contract";
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
import {
  createProductReturnTermRow,
  mapProductReturnTermsToRows,
  serializeProductReturnTermRows,
  validateProductReturnTermRows,
  type ProductReturnTermRow,
} from "@/entities/product/lib/productReturnTermRows";
import {
  isProductListingOrigin,
  type ProductListingOrigin,
} from "@/entities/product/lib/productListingOrigin";
import { ProductListingOriginChips } from "@/entities/product/ui/ProductListingOriginChips";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveSellerMaxLoyaltyPointsPerUnit";
import { validateProductName } from "@/entities/product/lib/validateProductName";
import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useMyProductsInfiniteQuery } from "@/entities/product/model/useMyProductsInfiniteQuery";
import { ProductCharacteristicsEditor } from "@/entities/product/ui/ProductCharacteristicsEditor";
import { ProductDescriptionField } from "@/entities/product/ui/ProductDescriptionField";
import { ProductPickupLocationFields } from "@/entities/product/ui/ProductPickupLocationFields";
import { ProductReturnTermsEditor } from "@/entities/product/ui/ProductReturnTermsEditor";
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

const LOYALTY_POINTS_MAX_LENGTH = 8;

const resolveReturnPolicyPrefill = (
  product: Record<string, unknown>,
): { enabled: boolean; rows: ProductReturnTermRow[] } => {
  const enabled = product.productReturnEnabled === true;
  if (!enabled) {
    return { enabled: false, rows: [] };
  }
  const rows = mapProductReturnTermsToRows(product.productReturnTerms);
  return {
    enabled: true,
    rows: rows.length > 0 ? rows : [createProductReturnTermRow()],
  };
};

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
  const [productListingOrigin, setProductListingOrigin] = useState<ProductListingOrigin | null>(
    null,
  );
  const [productIsOriginal, setProductIsOriginal] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOldPrice, setProductOldPrice] = useState("");
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const [productStockQuantity, setProductStockQuantity] = useState("1");
  const [loyaltyPointsPerUnit, setLoyaltyPointsPerUnit] = useState("0");
  const [productCategoryId, setProductCategoryId] = useState<string | null>(null);
  const [productCategoryLabel, setProductCategoryLabel] = useState("");
  const [productRegionCode, setProductRegionCode] = useState(DEFAULT_VIEWER_REGION_CODE);
  const [productPickupAddress, setProductPickupAddress] = useState("");
  const [productPickupLat, setProductPickupLat] = useState<number | null>(null);
  const [productPickupLon, setProductPickupLon] = useState<number | null>(null);
  const [productPickupEnabled, setProductPickupEnabled] = useState(true);
  const [productDeliveryEnabled, setProductDeliveryEnabled] = useState(false);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [characteristicRows, setCharacteristicRows] = useState<ProductCharacteristicRow[]>([]);
  const [productReturnEnabled, setProductReturnEnabled] = useState(false);
  const [returnTermRows, setReturnTermRows] = useState<ProductReturnTermRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!productQuery.data || isInitialized) {
      return;
    }
    const product = productQuery.data as Record<string, unknown>;
    setProductName(String(product.productName ?? "").trim());
    setProductListingOrigin(
      isProductListingOrigin(product.productListingOrigin) ? product.productListingOrigin : null,
    );
    setProductIsOriginal(product.productIsOriginal === true);
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
    const regionRaw =
      typeof product.productRegionCode === "string" ? product.productRegionCode.trim() : "";
    setProductRegionCode(isRuRegionCode(regionRaw) ? regionRaw : DEFAULT_VIEWER_REGION_CODE);
    setProductPickupAddress(String(product.productPickupAddress ?? "").trim());
    const latRaw = product.productPickupLat;
    const lonRaw = product.productPickupLon;
    setProductPickupLat(
      latRaw != null && Number.isFinite(Number(latRaw)) ? Number(latRaw) : null,
    );
    setProductPickupLon(
      lonRaw != null && Number.isFinite(Number(lonRaw)) ? Number(lonRaw) : null,
    );
    setProductDeliveryEnabled(product.productDeliveryEnabled === true);
    setProductPickupEnabled(product.productPickupEnabled !== false);
    setProductImageUrls(resolveProductImageUrls(product));
    setCharacteristicRows(mapProductCharacteristicsToRows(product.productCharacteristics));
    const returnPrefill = resolveReturnPolicyPrefill(product);
    setProductReturnEnabled(returnPrefill.enabled);
    setReturnTermRows(returnPrefill.rows);
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
    if (!isProductListingOrigin(productListingOrigin)) {
      return CREATE_PRODUCT_UI.ERROR_LISTING_ORIGIN;
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
    const pickupAddress = productPickupAddress.trim();
    if (pickupAddress.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
      return PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE;
    }
    const hasLat = productPickupLat != null && Number.isFinite(productPickupLat);
    const hasLon = productPickupLon != null && Number.isFinite(productPickupLon);
    if (!hasLat || !hasLon) {
      return CREATE_PRODUCT_UI.ERROR_PICKUP_COORDS;
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
    if (productReturnEnabled) {
      const returnError = validateProductReturnTermRows(returnTermRows);
      if (returnError) {
        return returnError;
      }
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
    const hasLat = productPickupLat != null && Number.isFinite(productPickupLat);
    const hasLon = productPickupLon != null && Number.isFinite(productPickupLon);

    try {
      await patchMutation.mutateAsync({
        productId,
        body: {
          productName: productName.trim(),
          productListingOrigin: productListingOrigin!,
          productIsOriginal,
          productDescription: productDescription.trim(),
          productPrice: parseRubPriceInput(productPrice) ?? 0,
          productOldPrice: oldPriceRaw ? oldPrice : null,
          productCategoryId: productCategoryId ?? undefined,
          ...(isRuRegionCode(productRegionCode.trim())
            ? { productRegionCode: productRegionCode.trim() }
            : {}),
          productPickupAddress: productPickupAddress.trim(),
          productPickupLat: hasLat ? productPickupLat : null,
          productPickupLon: hasLon ? productPickupLon : null,
          productPickupEnabled: productPickupEnabled !== false,
          productDeliveryEnabled: productDeliveryEnabled === true,
          productIsAvailable,
          productStockQuantity: productIsAvailable
            ? (parseStockQuantity(productStockQuantity) ?? PRODUCT_STOCK_QUANTITY_MIN)
            : undefined,
          productImageUrls,
          productCharacteristics: serializeProductCharacteristicRows(characteristicRows),
          loyaltyPointsPerUnit: Math.floor(Number(loyaltyPointsPerUnit)) || 0,
          productReturnEnabled,
          productReturnTerms: productReturnEnabled
            ? serializeProductReturnTermRows(returnTermRows)
            : [],
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

            <ProductListingOriginChips
              value={productListingOrigin}
              onChange={setProductListingOrigin}
              disabled={isBusy}
            />

            <View style={styles.field}>
              <Text style={styles.label}>{CREATE_PRODUCT_UI.ORIGINALITY_STATEMENT}</Text>
              <View style={styles.returnChoiceRow}>
                <Pressable
                  disabled={isBusy}
                  onPress={() => setProductIsOriginal(true)}
                  style={[
                    styles.returnChoiceChip,
                    {
                      borderColor: productIsOriginal
                        ? theme.colors.action
                        : theme.colors.border,
                      backgroundColor: productIsOriginal
                        ? theme.colors.action
                        : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.returnChoiceChipText,
                      {
                        color: productIsOriginal
                          ? theme.colors.onContrast
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {CREATE_PRODUCT_UI.ORIGINALITY_YES}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={isBusy}
                  onPress={() => setProductIsOriginal(false)}
                  style={[
                    styles.returnChoiceChip,
                    {
                      borderColor: !productIsOriginal
                        ? theme.colors.action
                        : theme.colors.border,
                      backgroundColor: !productIsOriginal
                        ? theme.colors.action
                        : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.returnChoiceChipText,
                      {
                        color: !productIsOriginal
                          ? theme.colors.onContrast
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {CREATE_PRODUCT_UI.ORIGINALITY_NO}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_DESCRIPTION}</Text>
              <ProductDescriptionField
                value={productDescription}
                onChangeText={setProductDescription}
                disabled={isBusy}
                inputStyle={[styles.input, styles.textArea]}
              />
            </View>

            <ProductCharacteristicsEditor
              rows={characteristicRows}
              onChange={setCharacteristicRows}
              disabled={isBusy}
            />

            <View style={styles.field}>
              <Text style={styles.label}>Есть ли возврат?</Text>
              <View style={styles.returnChoiceRow}>
                <Pressable
                  disabled={isBusy}
                  onPress={() => {
                    setProductReturnEnabled(true);
                    setReturnTermRows((prev) =>
                      prev.length > 0 ? prev : [createProductReturnTermRow()],
                    );
                  }}
                  style={[
                    styles.returnChoiceChip,
                    {
                      borderColor: productReturnEnabled
                        ? theme.colors.action
                        : theme.colors.border,
                      backgroundColor: productReturnEnabled
                        ? theme.colors.action
                        : theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.returnChoiceChipText,
                      {
                        color: productReturnEnabled
                          ? theme.colors.onContrast
                          : theme.colors.text,
                      },
                    ]}
                  >
                    Да
                  </Text>
                </Pressable>
                <Pressable
                  disabled={isBusy}
                  onPress={() => {
                    setProductReturnEnabled(false);
                    setReturnTermRows([]);
                  }}
                  style={[
                    styles.returnChoiceChip,
                    {
                      borderColor: !productReturnEnabled
                        ? theme.colors.action
                        : theme.colors.border,
                      backgroundColor: !productReturnEnabled
                        ? theme.colors.action
                        : theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.returnChoiceChipText,
                      {
                        color: !productReturnEnabled
                          ? theme.colors.onContrast
                          : theme.colors.text,
                      },
                    ]}
                  >
                    Нет
                  </Text>
                </Pressable>
              </View>
              {productReturnEnabled ? (
                <ProductReturnTermsEditor
                  rows={returnTermRows}
                  onChange={setReturnTermRows}
                  disabled={isBusy}
                />
              ) : null}
            </View>

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

            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              {CREATE_PRODUCT_UI.LABEL_SALE_REGION}
              {": "}
              {getRuRegionByCode(productRegionCode)?.name ||
                CREATE_PRODUCT_UI.HINT_SALE_REGION_FROM_ADDRESS}
            </Text>

            <ProductPickupLocationFields
              address={productPickupAddress}
              lat={productPickupLat}
              lon={productPickupLon}
              pickupEnabled={productPickupEnabled}
              deliveryEnabled={productDeliveryEnabled}
              disabled={isBusy}
              onChange={(next) => {
                setProductPickupAddress(next.productPickupAddress);
                setProductPickupLat(next.productPickupLat);
                setProductPickupLon(next.productPickupLon);
                setProductPickupEnabled(next.productPickupEnabled !== false);
                setProductDeliveryEnabled(next.productDeliveryEnabled === true);
                if (next.productRegionCode) {
                  setProductRegionCode(next.productRegionCode);
                }
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
