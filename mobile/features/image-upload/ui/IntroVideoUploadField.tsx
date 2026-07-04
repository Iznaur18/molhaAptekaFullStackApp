import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useUploadVideoMutation } from "@/entities/upload/model/useUploadVideoMutation";
import { INTRO_UPLOAD_VIDEO_MAX_BYTES } from "@/entities/upload/model/videoConstants";
import { pickVideoAsset } from "@/features/image-upload/lib/pickVideoAsset";
import { INTRO_VIDEO_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useMediaUploadFieldStyles } from "@/shared/theme/uploadFieldStyles";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type IntroVideoUploadFieldProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export const IntroVideoUploadField = ({
  label,
  value,
  onChange,
  disabled = false,
}: IntroVideoUploadFieldProps) => {
  const theme = useAppTheme();
  const styles = useMediaUploadFieldStyles();
  const uploadMutation = useUploadVideoMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = uploadMutation.isPending;

  const previewUri = value.trim() ? resolveUploadedMediaUrl(value.trim()) : "";
  const hasVideo = Boolean(previewUri);

  const buttonLabel = isBusy
    ? INTRO_VIDEO_UPLOAD_UI.UPLOAD_LOADING
    : hasVideo
      ? INTRO_VIDEO_UPLOAD_UI.REPLACE_BUTTON
      : INTRO_VIDEO_UPLOAD_UI.PICK_BUTTON;

  const handlePick = async () => {
    if (disabled || isBusy) {
      return;
    }

    setErrorMessage("");
    try {
      const asset = await pickVideoAsset({ maxBytes: INTRO_UPLOAD_VIDEO_MAX_BYTES });
      if (!asset) {
        return;
      }
      const storedUrl = await uploadMutation.mutateAsync({ ...asset, purpose: "intro" });
      onChange(storedUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : INTRO_VIDEO_UPLOAD_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
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
          <ActivityIndicator color={theme.colors.nearBlack} />
        ) : (
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        )}
      </Pressable>
      <Text style={styles.fieldHint}>{INTRO_VIDEO_UPLOAD_UI.DURATION_HINT}</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
