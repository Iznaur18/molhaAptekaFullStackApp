import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
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
      {displayUrl ? <CachedProductImage uri={displayUrl} style={styles.preview} /> : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        editable={!disabled && !isBusy}
        placeholder="https://… или /uploads/…"
        autoCapitalize="none"
      />
      <Pressable
        style={[styles.button, (disabled || isBusy) && styles.buttonDisabled]}
        onPress={() => {
          void handleUpload();
        }}
        disabled={disabled || isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.buttonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
        )}
      </Pressable>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  preview: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  error: {
    color: "#c62828",
    fontSize: 13,
  },
});
