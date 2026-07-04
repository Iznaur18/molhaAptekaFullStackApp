import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import type { UploadVideoPurpose } from "@/entities/upload/api/uploadVideo";
import { useUploadVideoMutation } from "@/entities/upload/model/useUploadVideoMutation";
import {
  INTRO_UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MAX_BYTES,
} from "@/entities/upload/model/videoConstants";
import { pickVideoAsset } from "@/features/image-upload/lib/pickVideoAsset";
import { VIDEO_URL_FIELD_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useMediaUploadFieldStyles } from "@/shared/theme/uploadFieldStyles";

type VideoUrlUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  /** «intro» — сервер обрежет ролик до лимита intro при загрузке. */
  uploadPurpose?: UploadVideoPurpose;
};

export const VideoUrlUploadField = ({
  label,
  value,
  onChange,
  disabled = false,
  uploadPurpose,
}: VideoUrlUploadFieldProps) => {
  const theme = useAppTheme();
  const styles = useMediaUploadFieldStyles();
  const uploadMutation = useUploadVideoMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = uploadMutation.isPending;

  const handleUpload = async () => {
    if (disabled || isBusy) {
      return;
    }

    setErrorMessage("");
    try {
      const asset = await pickVideoAsset({
        maxBytes:
          uploadPurpose === "intro"
            ? INTRO_UPLOAD_VIDEO_MAX_BYTES
            : UPLOAD_VIDEO_MAX_BYTES,
      });
      if (!asset) {
        return;
      }
      const storedUrl = await uploadMutation.mutateAsync({
        ...asset,
        purpose: uploadPurpose,
      });
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
          <ActivityIndicator color={theme.colors.nearBlack} />
        ) : (
          <Text style={styles.buttonText}>{VIDEO_URL_FIELD_UI.UPLOAD_BUTTON}</Text>
        )}
      </Pressable>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
