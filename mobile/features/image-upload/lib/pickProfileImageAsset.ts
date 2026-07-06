import * as ImagePicker from "expo-image-picker";

import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import { IMAGE_UPLOAD_UI } from "@/shared/config";

import { IMAGE_PICKER_GALLERY_OPTIONS } from "./imagePickerGalleryOptions";
import { prepareImageAssetForUpload } from "./prepareImageAssetForUpload";

export type PreparedImageUpload = UploadImageFilePayload;

const ensureLibraryPermission = async (): Promise<void> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(IMAGE_UPLOAD_UI.PERMISSION_DENIED);
  }
};

export const pickProfileImageAsset = async (): Promise<PreparedImageUpload | null> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    ...IMAGE_PICKER_GALLERY_OPTIONS,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return prepareImageAssetForUpload(result.assets[0], { namePrefix: "photo" });
};
