import type { ImagePickerOptions } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";

/** iOS 14+: JPEG вместо HEIC из «Фото» — иначе upload/превью ломаются на iPhone. */
export const IMAGE_PICKER_GALLERY_OPTIONS: ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: false,
  quality: 0.9,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};
