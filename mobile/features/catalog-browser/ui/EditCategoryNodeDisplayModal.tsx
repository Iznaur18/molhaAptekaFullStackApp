import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import type { ProductCategoryDisplayFromApi } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { resolveProductCategoryNodeDisplay } from "@/entities/product-category-display/lib/resolveProductCategoryNodeDisplay";
import { useProductCategoryDisplayMutations } from "@/entities/product-category-display/model/useProductCategoryDisplayMutations";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "@/shared/config";
import { useSyncAdminEditFormOnOpen } from "@/shared/model/useSyncAdminEditFormOnOpen";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdminEditModalStyles } from "@/shared/theme/modalChromeStyles";
import { AdminEditModalShell } from "@/shared/ui/AdminEditModalShell";

type EditCategoryNodeDisplayModalProps = {
  visible: boolean;
  categoryId: string | null;
  fallbackLabel: string | null;
  displays: ProductCategoryDisplayFromApi[];
  onClose: () => void;
  onSaved: () => void;
};

export const EditCategoryNodeDisplayModal = ({
  visible,
  categoryId,
  fallbackLabel,
  displays,
  onClose,
  onSaved,
}: EditCategoryNodeDisplayModalProps) => {
  const styles = useAdminEditModalStyles();
  const theme = useAppTheme();
  const { patchCategoryNodeMutation } = useProductCategoryDisplayMutations();
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isImageFieldBusy, setIsImageFieldBusy] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categoryId);
  const [activeFallbackLabel, setActiveFallbackLabel] = useState<string | null>(fallbackLabel);

  useEffect(() => {
    if (categoryId) {
      setActiveCategoryId(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    if (fallbackLabel) {
      setActiveFallbackLabel(fallbackLabel);
    }
  }, [fallbackLabel]);

  const resolved = useMemo(() => {
    if (!activeCategoryId || !activeFallbackLabel) {
      return null;
    }

    return resolveProductCategoryNodeDisplay(activeCategoryId, activeFallbackLabel, displays);
  }, [activeCategoryId, activeFallbackLabel, displays]);

  const syncFormFromResolved = useCallback(() => {
    if (!resolved) {
      return;
    }
    setLabel(resolved.isCustomLabel ? resolved.label : "");
    setImageUrl(resolved.imageUrl ?? "");
    setErrorMessage("");
  }, [resolved]);

  useSyncAdminEditFormOnOpen({
    visible,
    sessionKey: activeCategoryId,
    enabled: resolved != null,
    onSync: syncFormFromResolved,
  });

  const handleClose = useCallback(() => {
    setErrorMessage("");
    onClose();
  }, [onClose]);

  const handleDismissed = useCallback(() => {
    setActiveCategoryId(null);
    setActiveFallbackLabel(null);
  }, []);

  const handleSubmit = async () => {
    if (!activeCategoryId || !resolved) {
      return;
    }

    try {
      setErrorMessage("");
      const trimmedLabel = label.trim();
      const trimmedImage = imageUrl.trim();
      await patchCategoryNodeMutation.mutateAsync({
        categoryId: activeCategoryId,
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
    if (!activeCategoryId) {
      return;
    }

    try {
      setErrorMessage("");
      await patchCategoryNodeMutation.mutateAsync({
        categoryId: activeCategoryId,
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

  if (!activeCategoryId && !visible) {
    return null;
  }

  const isSaving = patchCategoryNodeMutation.isPending;

  return (
    <AdminEditModalShell
      visible={visible}
      onClose={handleClose}
      onDismissed={handleDismissed}
      dismissDisabled={isSaving || isImageFieldBusy}
    >
      {resolved ? (
        <>
          <Text style={styles.title}>
            {PRODUCT_CATEGORY_DISPLAY_UI.EDIT_TITLE(resolved.label)}
          </Text>

          <Text style={styles.fieldLabel}>{PRODUCT_CATEGORY_DISPLAY_UI.LABEL_FIELD}</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder={PRODUCT_CATEGORY_DISPLAY_UI.LABEL_PLACEHOLDER(resolved.fallbackLabel)}
            maxLength={120}
          />
          <Text style={styles.hint}>{PRODUCT_CATEGORY_DISPLAY_UI.LABEL_HINT}</Text>

          <ImageUrlUploadField
            label={PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_FIELD}
            value={imageUrl}
            onChange={setImageUrl}
            onInteractionBusyChange={setIsImageFieldBusy}
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
            <Text style={styles.closeLinkText}>{PRODUCT_CATEGORY_DISPLAY_UI.CLOSE_ARIA}</Text>
          </Pressable>
        </>
      ) : null}
    </AdminEditModalShell>
  );
};
