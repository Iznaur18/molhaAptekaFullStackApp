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

/**
 * Выбор фона профиля с кадрированием прямо в системном редакторе — так же, как
 * у аватара (`pickProfileImageAsset`): позиция задаётся при выборе, отдельный
 * drag-редактор не нужен. `aspect` под шапку-баннер работает на Android; iOS,
 * как и для аватара, даёт квадратный кроп.
 */
export const pickProfileBackgroundAsset = async (): Promise<UploadImageFilePayload | null> => {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    ...IMAGE_PICKER_GALLERY_OPTIONS,
    allowsEditing: true,
    aspect: [5, 3],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return prepareImageAssetForUpload(result.assets[0], { namePrefix: "background" });
};
