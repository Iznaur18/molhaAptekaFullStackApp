import * as ImagePicker from "expo-image-picker";

import {
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES,
  UPLOAD_IMAGE_MAX_BYTES,
} from "@/entities/upload/model/constants";
import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import { IMAGE_UPLOAD_UI } from "@/shared/config";

const buildFileName = (mimeType: string): string => {
  if (mimeType === "image/png") {
    return `image-${Date.now()}.png`;
  }
  if (mimeType === "image/webp") {
    return `image-${Date.now()}.webp`;
  }
  return `image-${Date.now()}.jpg`;
};

const ensureLibraryPermission = async (): Promise<void> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(IMAGE_UPLOAD_UI.PERMISSION_DENIED);
  }
};

export const pickGalleryImageAsset = async (): Promise<UploadImageFilePayload | null> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.9,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";

  if (!UPLOAD_IMAGE_ALLOWED_MIME_TYPES.has(mimeType) && mimeType !== "image/heic") {
    throw new Error(IMAGE_UPLOAD_UI.ERROR_TYPE);
  }

  if (asset.fileSize && asset.fileSize > UPLOAD_IMAGE_MAX_BYTES) {
    throw new Error(IMAGE_UPLOAD_UI.ERROR_SIZE);
  }

  return {
    uri: asset.uri,
    name: asset.fileName?.trim() || buildFileName(mimeType),
    type: mimeType === "image/heic" ? "image/jpeg" : mimeType,
  };
};
