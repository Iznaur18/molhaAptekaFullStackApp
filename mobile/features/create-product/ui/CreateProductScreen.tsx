import { PRODUCT_NAME_MAX_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCreateProductMutation } from "@/entities/product/model/useCreateProductMutation";
import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickProfileImageAsset } from "@/features/image-upload/lib/pickProfileImageAsset";
import { validateProductName } from "@/entities/product/lib/validateProductName";
import { CreateProductCategoryPicker } from "@/features/create-product/ui/CreateProductCategoryPicker";
import { CREATE_PRODUCT_UI, IMAGE_UPLOAD_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductEditorScreenStyles } from "@/shared/theme/sellerFlowStyles";

const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
const PRODUCT_STOCK_QUANTITY_MIN = 1;
const PRODUCT_STOCK_QUANTITY_MAX = 9999;

const parsePositiveInt = (value: string): number | null => {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const CreateProductScreen = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductEditorScreenStyles();
  const createMutation = useCreateProductMutation();
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

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createMutation.mutateAsync({
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        productPrice: parsePositiveInt(productPrice) ?? 0,
        productCategoryId: productCategoryId ?? undefined,
        productIsAvailable,
        productStockQuantity: productIsAvailable
          ? (parsePositiveInt(productStockQuantity) ?? PRODUCT_STOCK_QUANTITY_MIN)
          : undefined,
        productImageUrls: productImageUrl ? [productImageUrl] : undefined,
      });
      setSuccessMessage(CREATE_PRODUCT_UI.SUCCESS);
      setTimeout(() => {
        router.replace("/hub/my-products");
      }, 600);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : CREATE_PRODUCT_UI.SUBMIT);
    }
  };

  const isSubmitting = createMutation.isPending || uploadMutation.isPending;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>
        {CREATE_PRODUCT_UI.LABEL_NAME}
      </Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
        maxLength={PRODUCT_NAME_MAX_LENGTH}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>
        {CREATE_PRODUCT_UI.LABEL_DESCRIPTION}
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={productDescription}
        onChangeText={setProductDescription}
        multiline
        editable={!isSubmitting}
      />

      <Text style={styles.label}>
        {CREATE_PRODUCT_UI.LABEL_PRICE}
      </Text>
      <TextInput
        style={styles.input}
        value={productPrice}
        onChangeText={setProductPrice}
        keyboardType="number-pad"
        editable={!isSubmitting}
      />

      <CreateProductCategoryPicker
        selectedCategoryId={productCategoryId}
        selectedCategoryLabel={productCategoryLabel}
        onSelect={(categoryId, label) => {
          setProductCategoryId(categoryId);
          setProductCategoryLabel(label);
        }}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>
          {CREATE_PRODUCT_UI.LABEL_AVAILABLE}
        </Text>
        <Switch
          value={productIsAvailable}
          onValueChange={setProductIsAvailable}
          disabled={isSubmitting}
        />
      </View>

      {productIsAvailable ? (
        <>
          <Text style={styles.label}>
            {CREATE_PRODUCT_UI.LABEL_STOCK}
          </Text>
          <TextInput
            style={styles.input}
            value={productStockQuantity}
            onChangeText={setProductStockQuantity}
            keyboardType="number-pad"
            editable={!isSubmitting}
          />
        </>
      ) : null}

      <Text style={styles.label}>
        {CREATE_PRODUCT_UI.LABEL_IMAGE}
      </Text>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          void handlePickImage();
        }}
        disabled={isSubmitting}
      >
        <Text style={styles.secondaryButtonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
      </Pressable>
      {productImageUrl ? (
        <Text style={styles.imageUrl} numberOfLines={1}>
          {productImageUrl}
        </Text>
      ) : null}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>{CREATE_PRODUCT_UI.CANCEL}</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.disabled]}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.onContrast} />
          ) : (
            <Text style={styles.submitText}>{CREATE_PRODUCT_UI.SUBMIT}</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};
