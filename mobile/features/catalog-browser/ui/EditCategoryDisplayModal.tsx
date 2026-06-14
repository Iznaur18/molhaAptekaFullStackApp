import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import type { ProductCategoryDisplayFromApi } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { buildResolvedProductCategoryDisplaysFromRoots } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useProductCategoryDisplayMutations } from "@/entities/product-category-display/model/useProductCategoryDisplayMutations";
import type { ProductCategoryRootNode } from "@/entities/product-category-display/model/types";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdminEditModalStyles } from "@/shared/theme/modalChromeStyles";

type EditCategoryDisplayModalProps = {
  visible: boolean;
  categorySlug: string | null;
  displays: ProductCategoryDisplayFromApi[];
  categoryRoots: ProductCategoryRootNode[];
  onClose: () => void;
  onSaved: () => void;
};

export const EditCategoryDisplayModal = ({
  visible,
  categorySlug,
  displays,
  categoryRoots,
  onClose,
  onSaved,
}: EditCategoryDisplayModalProps) => {
  const styles = useAdminEditModalStyles();
  const theme = useAppTheme();
  const { patchCategoryMutation } = useProductCategoryDisplayMutations();
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resolved = categorySlug
    ? buildResolvedProductCategoryDisplaysFromRoots(categoryRoots, displays).find(
        (item) => item.categorySlug === categorySlug,
      ) ?? null
    : null;

  useEffect(() => {
    if (!visible || !resolved) {
      return;
    }
    setLabel(resolved.isCustomLabel ? resolved.label : "");
    setImageUrl(resolved.imageUrl ?? "");
    setErrorMessage("");
  }, [visible, resolved]);

  const handleClose = () => {
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!categorySlug || !resolved) {
      return;
    }

    try {
      setErrorMessage("");
      const trimmedLabel = label.trim();
      const trimmedImage = imageUrl.trim();
      await patchCategoryMutation.mutateAsync({
        categorySlug,
        body: {
          customLabel: trimmedLabel || null,
          imageUrl: trimmedImage || null,
          resetCustomLabel: trimmedLabel === "" && resolved.isCustomLabel,
          resetImageUrl: trimmedImage === "" && resolved.isCustomImage,
        },
      });
      onSaved();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_CATEGORY_DISPLAY_UI.SAVE_FALLBACK,
      );
    }
  };

  const handleReset = async () => {
    if (!categorySlug) {
      return;
    }

    try {
      setErrorMessage("");
      await patchCategoryMutation.mutateAsync({
        categorySlug,
        body: {
          resetCustomLabel: true,
          resetImageUrl: true,
        },
      });
      onSaved();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_CATEGORY_DISPLAY_UI.SAVE_FALLBACK,
      );
    }
  };

  if (!visible || !categorySlug || !resolved) {
    return null;
  }

  const isSaving = patchCategoryMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {PRODUCT_CATEGORY_DISPLAY_UI.EDIT_TITLE(resolved.label)}
            </Text>

            <Text style={styles.fieldLabel}>
              {PRODUCT_CATEGORY_DISPLAY_UI.LABEL_FIELD}
            </Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder={PRODUCT_CATEGORY_DISPLAY_UI.LABEL_PLACEHOLDER(resolved.label)}
              maxLength={120}
            />
            <Text style={styles.hint}>
              {PRODUCT_CATEGORY_DISPLAY_UI.LABEL_HINT}
            </Text>

            <ImageUrlUploadField
              label={PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_FIELD}
              value={imageUrl}
              onChange={setImageUrl}
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <View style={styles.actions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => void handleReset()}
                disabled={isSaving}
              >
                <Text style={styles.secondaryButtonText}>
                  {PRODUCT_CATEGORY_DISPLAY_UI.RESET_BUTTON}
                </Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={() => void handleSubmit()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.colors.onContrast} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {PRODUCT_CATEGORY_DISPLAY_UI.SAVE_BUTTON}
                  </Text>
                )}
              </Pressable>
            </View>

            <Pressable onPress={handleClose} style={styles.closeLink}>
              <Text style={styles.closeLinkText}>
                {PRODUCT_CATEGORY_DISPLAY_UI.CLOSE_ARIA}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
