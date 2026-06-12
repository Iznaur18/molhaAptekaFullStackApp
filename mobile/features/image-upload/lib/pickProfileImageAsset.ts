import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import {
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES,
  UPLOAD_IMAGE_MAX_BYTES,
} from "@/entities/upload/model/constants";
import { IMAGE_UPLOAD_UI } from "@/shared/config";

export type PreparedImageUpload = {
  uri: string;
  name: string;
  type: string;
};

const buildFileName = (mimeType: string): string => {
  if (mimeType === "image/png") {
    return `photo-${Date.now()}.png`;
  }
  if (mimeType === "image/webp") {
    return `photo-${Date.now()}.webp`;
  }
  return `photo-${Date.now()}.jpg`;
};

const ensureLibraryPermission = async (): Promise<void> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(IMAGE_UPLOAD_UI.PERMISSION_DENIED);
  }
};

const convertToUploadableJpeg = async (uri: string): Promise<PreparedImageUpload> => {
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
    name: buildFileName("image/jpeg"),
    type: "image/jpeg",
  };
};

export const pickProfileImageAsset = async (): Promise<PreparedImageUpload | null> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";

  if (!UPLOAD_IMAGE_ALLOWED_MIME_TYPES.has(mimeType) && mimeType !== "image/heic") {
    throw new Error(IMAGE_UPLOAD_UI.ERROR_TYPE);
  }

  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp") {
    if (asset.fileSize && asset.fileSize > UPLOAD_IMAGE_MAX_BYTES) {
      throw new Error(IMAGE_UPLOAD_UI.ERROR_SIZE);
    }

    return {
      uri: asset.uri,
      name: asset.fileName?.trim() || buildFileName(mimeType),
      type: mimeType,
    };
  }

  return convertToUploadableJpeg(asset.uri);
};
