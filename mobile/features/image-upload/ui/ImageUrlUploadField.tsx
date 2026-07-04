import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useMediaUploadFieldStyles } from "@/shared/theme/uploadFieldStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type ImageUrlUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export const ImageUrlUploadField = ({
  label,
  value,
  onChange,
  disabled = false,
}: ImageUrlUploadFieldProps) => {
  const theme = useAppTheme();
  const styles = useMediaUploadFieldStyles();
  const uploadMutation = useUploadImageMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = uploadMutation.isPending;
  const displayUrl = resolveUploadedMediaUrl(value);

  const handleUpload = async () => {
    if (disabled || isBusy) {
      return;
    }

    setErrorMessage("");
    try {
      const asset = await pickGalleryImageAsset();
      if (!asset) {
        return;
      }
      const storedUrl = await uploadMutation.mutateAsync(asset);
      onChange(storedUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : IMAGE_UPLOAD_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {displayUrl ? (
        <View style={styles.previewWrap}>
          <CachedProductImage uri={displayUrl} style={styles.preview} contentFit="contain" />
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        editable={!disabled && !isBusy}
        placeholder="https://… или /uploads/…"
        autoCapitalize="none"
        placeholderTextColor={theme.colors.textMuted}
      />
      <Pressable
        style={[styles.button, (disabled || isBusy) && styles.buttonDisabled]}
        onPress={() => {
          void handleUpload();
        }}
        disabled={disabled || isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color={theme.colors.onContrast} />
        ) : (
          <Text style={styles.buttonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
        )}
      </Pressable>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
