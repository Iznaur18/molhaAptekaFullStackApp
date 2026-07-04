import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useUploadVideoMutation } from "@/entities/upload/model/useUploadVideoMutation";
import { STORY_UPLOAD_VIDEO_MAX_BYTES } from "@/entities/upload/model/videoConstants";
import { pickVideoAsset } from "@/features/image-upload/lib/pickVideoAsset";
import { PRODUCT_PREVIEW_VIDEO_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useMediaUploadFieldStyles } from "@/shared/theme/uploadFieldStyles";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type ProductPreviewVideoUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export const ProductPreviewVideoUploadField = ({
  value,
  onChange,
  disabled = false,
}: ProductPreviewVideoUploadFieldProps) => {
  const theme = useAppTheme();
  const styles = useMediaUploadFieldStyles();
  const uploadMutation = useUploadVideoMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = uploadMutation.isPending;

  const previewUri = value.trim() ? resolveUploadedMediaUrl(value.trim()) : "";
  const hasVideo = Boolean(previewUri);

  const pickButtonLabel = isBusy
    ? PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.UPLOAD_LOADING
    : hasVideo
      ? PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.REPLACE_BUTTON
      : PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.PICK_BUTTON;

  const handlePick = async () => {
    if (disabled || isBusy) {
      return;
    }

    setErrorMessage("");
    try {
      const asset = await pickVideoAsset({ maxBytes: STORY_UPLOAD_VIDEO_MAX_BYTES });
      if (!asset) {
        return;
      }
      const storedUrl = await uploadMutation.mutateAsync({
        ...asset,
        purpose: "product-preview",
      });
      onChange(storedUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.ERROR_GENERIC,
      );
    }
  };

  const handleClear = () => {
    if (disabled || isBusy) {
      return;
    }
    setErrorMessage("");
    onChange("");
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.LABEL}{" "}
        <Text style={{ color: theme.colors.textMuted, fontWeight: "400" }}>
          {PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.OPTIONAL_TAG}
        </Text>
      </Text>
      <Text style={styles.fieldHint}>{PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.DURATION_HINT}</Text>
      {hasVideo ? (
        <View style={[styles.previewWrap, styles.preview]}>
          <ProductPreviewVideo uri={previewUri} />
        </View>
      ) : null}
      <Pressable
        style={[styles.button, (disabled || isBusy) && styles.buttonDisabled]}
        onPress={() => {
          void handlePick();
        }}
        disabled={disabled || isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color={theme.colors.onContrast} />
        ) : (
          <Text style={styles.buttonText}>{pickButtonLabel}</Text>
        )}
      </Pressable>
      {hasVideo ? (
        <Pressable
          style={[styles.dangerButton, (disabled || isBusy) && styles.buttonDisabled]}
          onPress={handleClear}
          disabled={disabled || isBusy}
        >
          <Text style={styles.dangerButtonText}>
            {PRODUCT_PREVIEW_VIDEO_UPLOAD_UI.CLEAR_BUTTON}
          </Text>
        </Pressable>
      ) : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
