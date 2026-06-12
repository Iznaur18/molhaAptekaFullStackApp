import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickProfileImageAsset } from "@/features/image-upload/lib/pickProfileImageAsset";
import { EDIT_PROFILE_UI, IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
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
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.buttonText}>{IMAGE_UPLOAD_UI.UPLOAD_BUTTON}</Text>
        )}
      </Pressable>
      <Text style={styles.hint}>{IMAGE_UPLOAD_UI.UPLOAD_HINT}</Text>
      {localError ? <Text style={styles.error}>{localError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  avatarWrap: {
    marginTop: 12,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#111",
    minWidth: 160,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  error: {
    marginTop: 8,
    fontSize: 13,
    color: "#c62828",
    textAlign: "center",
  },
});
