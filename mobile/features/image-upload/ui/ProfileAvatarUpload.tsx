import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickProfileImageAsset } from "@/features/image-upload/lib/pickProfileImageAsset";
import { EDIT_PROFILE_UI, IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProfileAvatarUploadStyles } from "@/shared/theme/uploadFieldStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type ProfileAvatarUploadProps = {
  avatarUrl: string;
  disabled?: boolean;
  onAvatarUrlChange: (url: string) => void;
  onError?: (message: string) => void;
};

export const ProfileAvatarUpload = ({
  avatarUrl,
  disabled = false,
  onAvatarUrlChange,
  onError,
}: ProfileAvatarUploadProps) => {
  const theme = useAppTheme();
  const styles = useProfileAvatarUploadStyles();
  const uploadMutation = useUploadImageMutation();
  const [localError, setLocalError] = useState("");
  const isBusy = uploadMutation.isPending;

  const displayUrl = resolveUploadedMediaUrl(avatarUrl);

  const handlePickAndUpload = async () => {
    if (disabled || isBusy) {
      return;
    }

    setLocalError("");
    try {
      const asset = await pickProfileImageAsset();
      if (!asset) {
        return;
      }

      const storedUrl = await uploadMutation.mutateAsync(asset);
      onAvatarUrlChange(storedUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : IMAGE_UPLOAD_UI.ERROR_GENERIC;
      setLocalError(message);
      onError?.(message);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_AVATAR}</Text>
      <View style={styles.avatarWrap}>
        <CachedProductImage uri={displayUrl} style={styles.avatar} />
      </View>
      <Pressable
        style={[styles.button, (disabled || isBusy) && styles.buttonDisabled]}
        onPress={handlePickAndUpload}
        disabled={disabled || isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color={theme.colors.nearBlack} />
        ) : (
          <Text style={styles.buttonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
        )}
      </Pressable>
      <Text style={styles.hint}>{IMAGE_UPLOAD_UI.UPLOAD_HINT}</Text>
      {localError ? <Text style={styles.error}>{localError}</Text> : null}
    </View>
  );
};
