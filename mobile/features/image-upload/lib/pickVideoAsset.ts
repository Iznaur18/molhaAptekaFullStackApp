import * as ImagePicker from "expo-image-picker";

import type { UploadVideoFilePayload } from "@/entities/upload/api/uploadVideo";
import {
  UPLOAD_VIDEO_ALLOWED_MIME_TYPES,
  UPLOAD_VIDEO_MAX_BYTES,
} from "@/entities/upload/model/videoConstants";
import { VIDEO_URL_FIELD_UI } from "@/shared/config";

const buildFileName = (mimeType: string): string => {
  if (mimeType === "video/webm") {
    return `video-${Date.now()}.webm`;
  }
  return `video-${Date.now()}.mp4`;
};

const ensureLibraryPermission = async (): Promise<void> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(VIDEO_URL_FIELD_UI.PERMISSION_DENIED);
  }
};

export const pickVideoAsset = async (): Promise<UploadVideoFilePayload | null> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "video/mp4";

  if (!UPLOAD_VIDEO_ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(VIDEO_URL_FIELD_UI.ERROR_TYPE);
  }

  if (asset.fileSize && asset.fileSize > UPLOAD_VIDEO_MAX_BYTES) {
    throw new Error(VIDEO_URL_FIELD_UI.ERROR_SIZE);
  }

  return {
    uri: asset.uri,
    name: asset.fileName?.trim() || buildFileName(mimeType),
    type: mimeType,
  };
};
