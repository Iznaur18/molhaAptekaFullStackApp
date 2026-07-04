import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickGalleryImageAssets } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductPhotoGridStyles } from "@/shared/theme/uploadFieldStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type ProductPhotoGridProps = {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxCount: number;
  disabled?: boolean;
};

export const ProductPhotoGrid = ({
  urls,
  onChange,
  maxCount,
  disabled = false,
}: ProductPhotoGridProps) => {
  const theme = useAppTheme();
  const styles = useProductPhotoGridStyles();
  const uploadMutation = useUploadImageMutation();
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const remaining = maxCount - urls.length - uploadingCount;
  const isBusy = uploadingCount > 0;

  const handleAdd = async () => {
    if (disabled || isBusy || remaining <= 0) {
      return;
    }
    setErrorMessage("");

    let assets;
    try {
      assets = await pickGalleryImageAssets(remaining);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : IMAGE_UPLOAD_UI.ERROR_GENERIC);
      return;
    }
    if (assets.length === 0) {
      return;
    }

    setUploadingCount(assets.length);
    let next = [...urls];
    for (const asset of assets) {
      try {
        const storedUrl = await uploadMutation.mutateAsync(asset);
        next = [...next, storedUrl];
        onChange(next);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : IMAGE_UPLOAD_UI.ERROR_GENERIC);
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
    }
  };

  const makeCover = (index: number) => {
    if (index === 0) {
      return;
    }
    onChange([urls[index], ...urls.filter((_, i) => i !== index)]);
  };

  const removeAt = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {urls.map((url, index) => (
          <Pressable
            key={`${url}-${index}`}
            style={styles.tile}
            onPress={() => makeCover(index)}
            disabled={disabled || index === 0}
          >
            <CachedProductImage
              uri={resolveUploadedMediaUrl(url)}
              style={styles.tileImage}
              contentFit="cover"
            />
            {index === 0 ? (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>{IMAGE_UPLOAD_UI.COVER_BADGE}</Text>
              </View>
            ) : null}
            <Pressable
              style={styles.removeBadge}
              hitSlop={8}
              onPress={() => removeAt(index)}
              disabled={disabled}
              accessibilityLabel={IMAGE_UPLOAD_UI.REMOVE_PHOTO}
            >
              <Text style={styles.removeBadgeText}>✕</Text>
            </Pressable>
          </Pressable>
        ))}

        {Array.from({ length: uploadingCount }).map((_, i) => (
          <View key={`uploading-${i}`} style={[styles.tile, styles.uploadingTile]}>
            <ActivityIndicator color={theme.colors.action} />
          </View>
        ))}

        {urls.length + uploadingCount < maxCount ? (
          <Pressable
            style={({ pressed }) => [
              styles.addTile,
              pressed && styles.addTilePressed,
              (disabled || isBusy) && styles.addTileDisabled,
            ]}
            onPress={() => {
              void handleAdd();
            }}
            disabled={disabled || isBusy}
          >
            <Text style={styles.addTilePlus}>+</Text>
            <Text style={styles.addTileLabel}>{IMAGE_UPLOAD_UI.ADD_PHOTO_TILE}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.counter}>{`${urls.length} из ${maxCount} фото`}</Text>
      {urls.length > 1 ? (
        <Text style={styles.hint}>{IMAGE_UPLOAD_UI.TAP_TO_COVER_HINT}</Text>
      ) : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
