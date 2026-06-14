import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUploadVideoMutation } from "@/entities/upload/model/useUploadVideoMutation";
import { pickVideoAsset } from "@/features/image-upload/lib/pickVideoAsset";
import { VIDEO_URL_FIELD_UI } from "@/shared/config";

type VideoUrlUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export const VideoUrlUploadField = ({
  label,
  value,
  onChange,
  disabled = false,
}: VideoUrlUploadFieldProps) => {
  const uploadMutation = useUploadVideoMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = uploadMutation.isPending;

  const handleUpload = async () => {
    if (disabled || isBusy) {
      return;
    }

    setErrorMessage("");
    try {
      const asset = await pickVideoAsset();
      if (!asset) {
        return;
      }
      const storedUrl = await uploadMutation.mutateAsync(asset);
      onChange(storedUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : VIDEO_URL_FIELD_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
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
          <Text style={styles.buttonText}>{VIDEO_URL_FIELD_UI.UPLOAD_BUTTON}</Text>
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
