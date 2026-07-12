import * as ImageManipulator from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import {
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES,
  UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION,
  UPLOAD_IMAGE_COMPRESS_TARGET_BYTES,
  UPLOAD_IMAGE_MAX_BYTES,
  UPLOAD_IMAGE_SOURCE_MAX_BYTES,
} from "@/entities/upload/model/constants";
import { IMAGE_UPLOAD_UI } from "@/shared/config";

const IOS_INCOMPATIBLE_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

/** Шаги качества JPEG при подгонке под целевой размер. */
const COMPRESS_QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4];
/** Во сколько раз уменьшаем сторону, если качество уже минимальное. */
const DIMENSION_STEP_RATIO = 0.75;
/** Ниже этой стороны не даунскейлим — фото станет нечитаемым. */
const MIN_DIMENSION = 640;

const buildFileName = (namePrefix: string, mimeType: string): string => {
  if (mimeType === "image/png") {
    return `${namePrefix}-${Date.now()}.png`;
  }
  if (mimeType === "image/webp") {
    return `${namePrefix}-${Date.now()}.webp`;
  }
  return `${namePrefix}-${Date.now()}.jpg`;
};

const isHeicAsset = (asset: ImagePickerAsset): boolean => {
  const haystack = `${asset.uri} ${asset.fileName ?? ""}`.toLowerCase();
  return haystack.includes(".heic") || haystack.includes(".heif");
};

const isDirectlyUploadableMimeType = (mimeType: string): boolean =>
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES.has(mimeType) || mimeType === "image/jpg";

const needsJpegConversion = (mimeType: string, asset: ImagePickerAsset): boolean =>
  IOS_INCOMPATIBLE_MIME_TYPES.has(mimeType) ||
  isHeicAsset(asset) ||
  !isDirectlyUploadableMimeType(mimeType);

const getFileSizeAtUri = async (uri: string): Promise<number> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob.size;
};

/**
 * Итеративно сжимает изображение в JPEG: даунскейл до максимальной стороны,
 * затем понижение качества; если не влезло — уменьшение стороны и новый круг.
 * Практически любое фото укладывается в целевой размер.
 */
const compressImageAssetToJpeg = async (
  asset: ImagePickerAsset,
  namePrefix: string,
): Promise<UploadImageFilePayload> => {
  const sourceWidth = asset.width || UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION;
  const sourceHeight = asset.height || UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION;
  const sourceMaxSide = Math.max(sourceWidth, sourceHeight);
  let maxSide = Math.min(UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION, sourceMaxSide);
  let smallest: { uri: string; size: number } | null = null;

  for (;;) {
    const actions: ImageManipulator.Action[] =
      maxSide < sourceMaxSide
        ? [
            {
              resize:
                sourceWidth >= sourceHeight ? { width: maxSide } : { height: maxSide },
            },
          ]
        : [];

    for (const quality of COMPRESS_QUALITY_STEPS) {
      const manipulated = await ImageManipulator.manipulateAsync(asset.uri, actions, {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const size = await getFileSizeAtUri(manipulated.uri);

      if (!smallest || size < smallest.size) {
        smallest = { uri: manipulated.uri, size };
      }
      if (size <= UPLOAD_IMAGE_COMPRESS_TARGET_BYTES) {
        return {
          uri: manipulated.uri,
          name: buildFileName(namePrefix, "image/jpeg"),
          type: "image/jpeg",
        };
      }
    }

    if (maxSide <= MIN_DIMENSION) {
      break;
    }
    maxSide = Math.max(MIN_DIMENSION, Math.round(maxSide * DIMENSION_STEP_RATIO));
  }

  // До цели не дожали (экзотика) — отправляем лучшее, пока влезает в серверный лимит.
  if (smallest && smallest.size <= UPLOAD_IMAGE_MAX_BYTES) {
    return {
      uri: smallest.uri,
      name: buildFileName(namePrefix, "image/jpeg"),
      type: "image/jpeg",
    };
  }
  throw new Error(IMAGE_UPLOAD_UI.ERROR_SIZE);
};

type PrepareImageAssetForUploadOptions = {
  namePrefix?: string;
};

/**
 * Готовит выбранное изображение к загрузке: исходник принимаем до 50 МБ,
 * но большие файлы (и HEIC/неизвестный MIME) автоматически пережимаются
 * в JPEG под целевой размер — на сервер большой оригинал не уходит.
 */
export const prepareImageAssetForUpload = async (
  asset: ImagePickerAsset,
  options?: PrepareImageAssetForUploadOptions,
): Promise<UploadImageFilePayload> => {
  const namePrefix = options?.namePrefix ?? "image";
  const mimeType = asset.mimeType ?? "image/jpeg";

  if (asset.fileSize && asset.fileSize > UPLOAD_IMAGE_SOURCE_MAX_BYTES) {
    throw new Error(IMAGE_UPLOAD_UI.ERROR_SIZE);
  }

  const exceedsTargetSize =
    asset.fileSize != null && asset.fileSize > UPLOAD_IMAGE_COMPRESS_TARGET_BYTES;
  const exceedsMaxDimension =
    Math.max(asset.width || 0, asset.height || 0) > UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION;

  if (needsJpegConversion(mimeType, asset) || exceedsTargetSize || exceedsMaxDimension) {
    return compressImageAssetToJpeg(asset, namePrefix);
  }

  const normalizedMimeType = mimeType === "image/jpg" ? "image/jpeg" : mimeType;

  return {
    uri: asset.uri,
    name: asset.fileName?.trim() || buildFileName(namePrefix, normalizedMimeType),
    type: normalizedMimeType,
  };
};
