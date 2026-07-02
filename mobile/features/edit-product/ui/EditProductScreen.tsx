import { PRODUCT_NAME_MAX_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { validateProductName } from "@/entities/product/lib/validateProductName";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickProfileImageAsset } from "@/features/image-upload/lib/pickProfileImageAsset";
import { CreateProductCategoryPicker } from "@/features/create-product/ui/CreateProductCategoryPicker";
import { API_CLIENT_UI, CREATE_PRODUCT_UI, IMAGE_UPLOAD_UI, PRODUCT_REPORT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductEditorScreenStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
const PRODUCT_STOCK_QUANTITY_MIN = 1;
const PRODUCT_STOCK_QUANTITY_MAX = 9999;

type EditProductScreenProps = {
  productId: string;
};

const parsePositiveInt = (value: string): number | null => {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const EditProductScreen = ({ productId }: EditProductScreenProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductEditorScreenStyles();
  const productQuery = useCatalogProductQuery(productId);
  const { patchMutation, deleteMutation } = useMyProductMutations();
  const uploadMutation = useUploadImageMutation();

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const [productStockQuantity, setProductStockQuantity] = useState("1");
  const [productCategoryId, setProductCategoryId] = useState<string | null>(null);
  const [productCategoryLabel, setProductCategoryLabel] = useState("");
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
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
    setProductPrice(String(product.productPrice ?? ""));
    setProductIsAvailable(product.productIsAvailable !== false);
    setProductStockQuantity(String(product.productStockQuantity ?? 1));
    const categoryId = product.productCategoryId;
    if (typeof categoryId === "string" && categoryId.trim()) {
      setProductCategoryId(categoryId);
      setProductCategoryLabel(String(product.productCategoryLabelRu ?? categoryId));
    }
    const urls = Array.isArray(product.productImageUrls) ? product.productImageUrls : [];
    const firstUrl = urls[0] ?? product.productImageUrl;
    setProductImageUrl(typeof firstUrl === "string" ? firstUrl : null);
    setIsInitialized(true);
  }, [isInitialized, productQuery.data]);

  const validateForm = (): string | null => {
    const nameError = validateProductName(productName);
    if (nameError) {
      return nameError;
    }
    if (productDescription.trim().length < PRODUCT_DESCRIPTION_MIN_CHARS) {
      return CREATE_PRODUCT_UI.ERROR_DESCRIPTION;
    }
    const price = parsePositiveInt(productPrice);
    if (price == null || price < 0) {
      return CREATE_PRODUCT_UI.ERROR_PRICE;
    }
    if (!productCategoryId) {
      return CREATE_PRODUCT_UI.ERROR_CATEGORY;
    }
    if (productIsAvailable) {
      const stock = parsePositiveInt(productStockQuantity);
      if (
        stock == null ||
        stock < PRODUCT_STOCK_QUANTITY_MIN ||
        stock > PRODUCT_STOCK_QUANTITY_MAX
      ) {
        return CREATE_PRODUCT_UI.ERROR_STOCK;
      }
    }
    return null;
  };

  const isBusy =
    patchMutation.isPending || deleteMutation.isPending || uploadMutation.isPending;

  const handlePickImage = async () => {
    setErrorMessage("");
    try {
      const asset = await pickProfileImageAsset();
      if (!asset) {
        return;
      }
      const url = await uploadMutation.mutateAsync(asset);
      setProductImageUrl(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : IMAGE_UPLOAD_UI.ERROR_GENERIC);
    }
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await patchMutation.mutateAsync({
        productId,
        body: {
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          productPrice: parsePositiveInt(productPrice) ?? 0,
          productCategoryId: productCategoryId ?? undefined,
          productIsAvailable,
          productStockQuantity: productIsAvailable
            ? (parsePositiveInt(productStockQuantity) ?? PRODUCT_STOCK_QUANTITY_MIN)
            : undefined,
          productImageUrls: productImageUrl ? [productImageUrl] : undefined,
        },
      });
      setSuccessMessage(CREATE_PRODUCT_UI.SAVED);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : CREATE_PRODUCT_UI.SAVE);
    }
  };

  const handleDelete = () => {
    Alert.alert(CREATE_PRODUCT_UI.DELETE, CREATE_PRODUCT_UI.DELETE_CONFIRM, [
      { text: PRODUCT_REPORT_UI.CANCEL, style: "cancel" },
      {
        text: CREATE_PRODUCT_UI.DELETE,
        style: "destructive",
        onPress: () => {
          void runDelete();
        },
      },
    ]);
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
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

      <View style={styles.field}>
        <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_PRICE}</Text>
        <TextInput
          style={styles.input}
          value={productPrice}
          onChangeText={setProductPrice}
          keyboardType="number-pad"
          editable={!isBusy}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <CreateProductCategoryPicker
        selectedCategoryId={productCategoryId}
        selectedCategoryLabel={productCategoryLabel}
        onSelect={(categoryId, label) => {
          setProductCategoryId(categoryId);
          setProductCategoryLabel(label);
        }}
      />

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
        <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_IMAGE}</Text>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => {
            void handlePickImage();
          }}
          disabled={isBusy}
        >
          <Text style={styles.secondaryButtonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
        </Pressable>
        {productImageUrl ? (
          <Text style={styles.imageUrl} numberOfLines={1}>
            {productImageUrl}
          </Text>
        ) : null}
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
    </ScrollView>
  );
};
