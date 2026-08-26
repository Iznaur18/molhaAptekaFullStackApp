import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";

import { resolveProductMediaDisplayHeight } from "@izibuy/design-tokens";

import { useUploadImageMutation } from "@/entities/upload/model/useUploadImageMutation";
import { pickGalleryImageAssets } from "@/features/image-upload/lib/pickGalleryImageAsset";
import { IMAGE_UPLOAD_UI } from "@/shared/config";
import { resolveGridTileWidth } from "@/shared/lib/resolveGridTileWidth";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  PRODUCT_PHOTO_GRID_COLUMNS,
  PRODUCT_PHOTO_GRID_GAP,
  useProductPhotoGridStyles,
} from "@/shared/theme/uploadFieldStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

/** Web ScrollView: появление/исчезновение scrollbar даёт ±12–17px и бесконечный onLayout. */
const SCROLLBAR_WIDTH_OSCILLATION_MAX_PX = 20;

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
  const [gridWidth, setGridWidth] = useState(0);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const remaining = maxCount - urls.length - uploadingCount;
  const isBusy = uploadingCount > 0;

  const tileSize = useMemo(
    () => resolveGridTileWidth(gridWidth, PRODUCT_PHOTO_GRID_COLUMNS, PRODUCT_PHOTO_GRID_GAP),
    [gridWidth],
  );

  const tileHeight = useMemo(() => resolveProductMediaDisplayHeight(tileSize), [tileSize]);

  const tileDimensions =
    tileSize > 0 ? { width: tileSize, height: tileHeight } : { width: 0, height: 0 };

  const handleWidthProbeLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth <= 0) {
      return;
    }
    setGridWidth((current) => {
      if (current === nextWidth) {
        return current;
      }
      // Игнор мелкого сжатия: scrollbar появился → height вырос → width чуть упал → цикл.
      if (
        current > 0 &&
        nextWidth < current &&
        current - nextWidth <= SCROLLBAR_WIDTH_OSCILLATION_MAX_PX
      ) {
        return current;
      }
      return nextWidth;
    });
  }, []);

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
      {/* Ширину меряем пустым зондом, не сеткой: появление тайлов не дёргает layout. */}
      <View style={styles.widthProbe} onLayout={handleWidthProbeLayout} />
      <View style={styles.grid}>
        {tileSize > 0
          ? urls.map((url, index) => (
              <Pressable
                key={url}
                style={[styles.tile, tileDimensions]}
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
            ))
          : null}

        {tileSize > 0
          ? Array.from({ length: uploadingCount }).map((_, i) => (
              <View
                key={`uploading-${i}`}
                style={[styles.tile, styles.uploadingTile, tileDimensions]}
              >
                <ActivityIndicator color={theme.colors.action} />
              </View>
            ))
          : null}

        {urls.length + uploadingCount < maxCount && tileSize > 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.addTile,
              tileDimensions,
              pressed && styles.addTilePressed,
              (disabled || isBusy) && styles.addTileDisabled,
            ]}
            onPress={() => {
              void handleAdd();
            }}
            disabled={disabled || isBusy}
            accessibilityLabel={IMAGE_UPLOAD_UI.UPLOAD_BUTTON}
          >
            <Text style={styles.addTileLabel} numberOfLines={1}>
              + {IMAGE_UPLOAD_UI.ADD_PHOTO_TILE}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.counter}>{`${urls.length} из ${maxCount} фото`}</Text>
      {urls.length > 0 ? (
        <Text style={styles.hint}>{IMAGE_UPLOAD_UI.PRODUCT_PHOTO_CROP_HINT}</Text>
      ) : null}
      {urls.length > 1 ? (
        <Text style={styles.hint}>{IMAGE_UPLOAD_UI.TAP_TO_COVER_HINT}</Text>
      ) : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
