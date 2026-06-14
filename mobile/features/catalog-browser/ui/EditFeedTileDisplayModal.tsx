import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  buildResolvedCatalogFeedTileDisplays,
  findCatalogFeedTileByKey,
  type ProductCatalogFeedTileDisplayFromApi,
} from "@/entities/product-category-display/lib/resolveCatalogFeedTileDisplay";
import { useProductCategoryDisplayMutations } from "@/entities/product-category-display/model/useProductCategoryDisplayMutations";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type EditFeedTileDisplayModalProps = {
  visible: boolean;
  tileKey: string | null;
  displays: ProductCatalogFeedTileDisplayFromApi[];
  onClose: () => void;
  onSaved: () => void;
};

export const EditFeedTileDisplayModal = ({
  visible,
  tileKey,
  displays,
  onClose,
  onSaved,
}: EditFeedTileDisplayModalProps) => {
  const theme = useAppTheme();
  const { patchFeedTileMutation } = useProductCategoryDisplayMutations();
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resolved = useMemo(() => {
    if (!tileKey) {
      return null;
    }
    return (
      buildResolvedCatalogFeedTileDisplays(displays).find((item) => item.tileKey === tileKey) ??
      null
    );
  }, [displays, tileKey]);

  const defaultLabel = tileKey ? (findCatalogFeedTileByKey(tileKey)?.label ?? "") : "";

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
    if (!tileKey || !resolved) {
      return;
    }

    try {
      setErrorMessage("");
      const trimmedLabel = label.trim();
      const trimmedImage = imageUrl.trim();
      await patchFeedTileMutation.mutateAsync({
        tileKey,
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
        error instanceof Error ? error.message : PRODUCT_CATEGORY_DISPLAY_UI.FEED_SAVE_FALLBACK,
      );
    }
  };

  const handleReset = async () => {
    if (!tileKey) {
      return;
    }

    try {
      setErrorMessage("");
      await patchFeedTileMutation.mutateAsync({
        tileKey,
        body: {
          resetCustomLabel: true,
          resetImageUrl: true,
        },
      });
      onSaved();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_CATEGORY_DISPLAY_UI.FEED_SAVE_FALLBACK,
      );
    }
  };

  if (!visible || !tileKey || !resolved) {
    return null;
  }

  const isSaving = patchFeedTileMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {PRODUCT_CATEGORY_DISPLAY_UI.FEED_EDIT_TITLE(resolved.label)}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              {PRODUCT_CATEGORY_DISPLAY_UI.LABEL_FIELD}
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
              value={label}
              onChangeText={setLabel}
              placeholder={PRODUCT_CATEGORY_DISPLAY_UI.LABEL_PLACEHOLDER(defaultLabel)}
              maxLength={120}
            />
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
              {PRODUCT_CATEGORY_DISPLAY_UI.FEED_LABEL_HINT}
            </Text>

            <ImageUrlUploadField
              label={PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_FIELD}
              value={imageUrl}
              onChange={setImageUrl}
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <View style={styles.actions}>
              <Pressable
                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={() => void handleReset()}
                disabled={isSaving}
              >
                <Text style={{ color: theme.colors.text }}>
                  {PRODUCT_CATEGORY_DISPLAY_UI.RESET_BUTTON}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: theme.colors.nearBlack }]}
                onPress={() => void handleSubmit()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {PRODUCT_CATEGORY_DISPLAY_UI.SAVE_BUTTON}
                  </Text>
                )}
              </Pressable>
            </View>

            <Pressable onPress={handleClose} style={styles.closeLink}>
              <Text style={{ color: theme.colors.textMuted }}>
                {PRODUCT_CATEGORY_DISPLAY_UI.CLOSE_ARIA}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeLink: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
});
