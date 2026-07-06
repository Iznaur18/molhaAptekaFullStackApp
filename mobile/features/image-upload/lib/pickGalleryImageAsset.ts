import * as ImagePicker from "expo-image-picker";

import type { UploadImageFilePayload } from "@/entities/upload/api/uploadImage";
import { IMAGE_UPLOAD_UI } from "@/shared/config";

import { IMAGE_PICKER_GALLERY_OPTIONS } from "./imagePickerGalleryOptions";
import { prepareImageAssetForUpload } from "./prepareImageAssetForUpload";

const ensureLibraryPermission = async (): Promise<void> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(IMAGE_UPLOAD_UI.PERMISSION_DENIED);
  }
};

export const pickGalleryImageAsset = async (): Promise<UploadImageFilePayload | null> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_GALLERY_OPTIONS);

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return prepareImageAssetForUpload(result.assets[0]);
};

export const pickGalleryImageAssets = async (
  selectionLimit: number,
): Promise<UploadImageFilePayload[]> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    ...IMAGE_PICKER_GALLERY_OPTIONS,
    allowsMultipleSelection: true,
    orderedSelection: true,
    selectionLimit,
  });

  if (result.canceled || result.assets.length === 0) {
    return [];
  }

  return Promise.all(
    result.assets.slice(0, selectionLimit).map((asset) => prepareImageAssetForUpload(asset)),
  );
};
