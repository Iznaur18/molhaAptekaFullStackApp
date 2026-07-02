import * as ImageManipulator from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import {
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES,
  UPLOAD_IMAGE_MAX_BYTES,
} from "@/entities/upload/model/constants";
import { IMAGE_UPLOAD_UI } from "@/shared/config";

const IOS_INCOMPATIBLE_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

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

const convertToUploadableJpeg = async (
  uri: string,
  namePrefix: string,
): Promise<UploadImageFilePayload> => {
  const manipulated = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const response = await fetch(manipulated.uri);
  const blob = await response.blob();

  if (blob.size > UPLOAD_IMAGE_MAX_BYTES) {
    throw new Error(IMAGE_UPLOAD_UI.ERROR_SIZE);
  }

  return {
    uri: manipulated.uri,
    name: buildFileName(namePrefix, "image/jpeg"),
    type: "image/jpeg",
  };
};

type PrepareImageAssetForUploadOptions = {
  namePrefix?: string;
};

export const prepareImageAssetForUpload = async (
  asset: ImagePickerAsset,
  options?: PrepareImageAssetForUploadOptions,
): Promise<UploadImageFilePayload> => {
  const namePrefix = options?.namePrefix ?? "image";
  const mimeType = asset.mimeType ?? "image/jpeg";

  if (needsJpegConversion(mimeType, asset)) {
    return convertToUploadableJpeg(asset.uri, namePrefix);
  }

  if (asset.fileSize && asset.fileSize > UPLOAD_IMAGE_MAX_BYTES) {
    throw new Error(IMAGE_UPLOAD_UI.ERROR_SIZE);
  }

  const normalizedMimeType = mimeType === "image/jpg" ? "image/jpeg" : mimeType;

  return {
    uri: asset.uri,
    name: asset.fileName?.trim() || buildFileName(namePrefix, normalizedMimeType),
    type: normalizedMimeType,
  };
};
