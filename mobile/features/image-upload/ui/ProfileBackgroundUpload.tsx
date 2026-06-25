import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { USER_BACKGROUND_PRESETS } from "@/entities/user/model/userBackgroundPresets";
import { resolveBackgroundForPreview, type BackgroundMode } from "@/entities/user/lib/userBackgroundValue";
import { pickGalleryImageAsset } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { EDIT_PROFILE_UI, IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProfileBackgroundUploadProps = {
  mode: BackgroundMode;
  presetId: string;
  imageUrl: string;
  disabled?: boolean;
  onModeChange: (mode: BackgroundMode) => void;
  onPresetChange: (presetId: string) => void;
  onImageUrlChange: (url: string) => void;
  onError?: (message: string) => void;
};

export const ProfileBackgroundUpload = ({
  mode,
  presetId,
  imageUrl,
  disabled = false,
  onModeChange,
  onPresetChange,
  onImageUrlChange,
  onError,
}: ProfileBackgroundUploadProps) => {
  const theme = useAppTheme();
  const uploadMutation = useUploadImageMutation();
  const [localError, setLocalError] = useState("");
  const isBusy = uploadMutation.isPending;

  const preview = resolveBackgroundForPreview(mode, { presetId, imageUrl });

  const handlePickAndUpload = async () => {
    if (disabled || isBusy) return;
    setLocalError("");
    try {
      const asset = await pickGalleryImageAsset();
      if (!asset) return;
      const storedUrl = await uploadMutation.mutateAsync(asset);
      onImageUrlChange(storedUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : IMAGE_UPLOAD_UI.ERROR_GENERIC;
      setLocalError(message);
      onError?.(message);
    }
  };

  const handleRemoveImage = () => {
    onImageUrlChange("");
    onModeChange("preset");
  };

  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {EDIT_PROFILE_UI.LABEL_BACKGROUND}
      </Text>

      {/* Mode switcher */}
      <View style={styles.modeSwitcher}>
        {(["preset", "image"] as BackgroundMode[]).map((m, i) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => !disabled && onModeChange(m)}
              style={[
                styles.modeBtn,
                i === 0 && styles.modeBtnFirst,
                i === 1 && styles.modeBtnLast,
                active && { backgroundColor: theme.colors.action, borderColor: theme.colors.action },
              ]}
            >
              <Text style={[styles.modeBtnText, { color: active ? "#fff" : theme.colors.text }]}>
                {m === "preset" ? EDIT_PROFILE_UI.BG_MODE_PRESET : EDIT_PROFILE_UI.BG_MODE_IMAGE}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Preview strip */}
      <View style={styles.previewWrap}>
        {preview.kind === "image" ? (
          <Image
            source={{ uri: resolveUploadedMediaUrl(preview.imageUrl) }}
            style={styles.preview}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.preview, { backgroundColor: preview.color }]} />
        )}
      </View>

      {/* Preset swatches */}
      {mode === "preset" ? (
        <View>
          <Text style={[styles.legend, { color: theme.colors.textMuted }]}>
            {EDIT_PROFILE_UI.BG_PRESET_LEGEND}
          </Text>
          <View style={styles.swatchGrid}>
            {USER_BACKGROUND_PRESETS.map((preset) => {
              const selected = presetId === preset.id;
              return (
                <Pressable
                  key={preset.id}
                  onPress={() => !disabled && onPresetChange(preset.id)}
                  style={[
                    styles.swatch,
                    { backgroundColor: preset.hex },
                    selected && styles.swatchSelected,
                  ]}
                  accessibilityLabel={preset.labelRu}
                >
                  {selected ? (
                    <View style={styles.swatchCheck} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.swatchLabels}>
            {USER_BACKGROUND_PRESETS.map((preset) => (
              <Text
                key={preset.id}
                style={[
                  styles.swatchLabel,
                  { color: presetId === preset.id ? theme.colors.action : theme.colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {preset.labelRu}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* Image upload controls */}
      {mode === "image" ? (
        <View style={styles.imageControls}>
          <Pressable
            onPress={handlePickAndUpload}
            disabled={disabled || isBusy}
            style={[
              styles.uploadBtn,
              { borderColor: theme.colors.border },
              (disabled || isBusy) && styles.uploadBtnDisabled,
            ]}
          >
            {isBusy ? (
              <ActivityIndicator color={theme.colors.action} />
            ) : (
              <Text style={[styles.uploadBtnText, { color: theme.colors.action }]}>
                {EDIT_PROFILE_UI.BG_UPLOAD_BUTTON}
              </Text>
            )}
          </Pressable>
          {imageUrl ? (
            <Pressable
              onPress={handleRemoveImage}
              disabled={disabled}
              style={[styles.removeBtn, { borderColor: theme.colors.danger }]}
            >
              <Text style={[styles.removeBtnText, { color: theme.colors.danger }]}>
                {EDIT_PROFILE_UI.BG_REMOVE_IMAGE}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {localError ? (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{localError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  modeSwitcher: {
    flexDirection: "row",
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  modeBtnFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  modeBtnLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  previewWrap: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: 80,
    borderRadius: 8,
  },
  legend: {
    fontSize: 12,
    marginBottom: 6,
  },
  swatchGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  swatchCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  swatchLabels: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 4,
  },
  swatchLabel: {
    width: 36,
    fontSize: 10,
    textAlign: "center",
  },
  imageControls: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  uploadBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  removeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    fontSize: 13,
    marginTop: 4,
  },
});
