import { Platform } from "react-native";

import { apiClient, parseUploadImageData } from "@/shared/api";
import { IMAGE_UPLOAD_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { normalizeUploadUrlForStorage } from "@/shared/lib/normalizeUploadUrlForStorage";

export type UploadImageFilePayload = {
  uri: string;
  name: string;
  type: string;
};

const appendImageToFormData = async (
  formData: FormData,
  file: UploadImageFilePayload,
): Promise<void> => {
  if (Platform.OS === "web") {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append("image", blob, file.name);
    return;
  }

  formData.append("image", file as unknown as Blob);
};

export const uploadImage = async (file: UploadImageFilePayload): Promise<string> => {
  try {
    const formData = new FormData();
    await appendImageToFormData(formData, file);

    const { data } = await apiClient.post("/upload", formData, {
      transformRequest: (payload, headers) => {
        delete headers["Content-Type"];
        return payload;
      },
    });

    const parsed = parseUploadImageData(data);
    return normalizeUploadUrlForStorage(parsed.url);
  } catch (error) {
    const axiosStatus = (error as { response?: { status?: number } })?.response?.status;
    if (axiosStatus === 401) {
      throw new Error(IMAGE_UPLOAD_UI.ERROR_AUTH);
    }
    throw new Error(formatApiErrorMessage(error, IMAGE_UPLOAD_UI.ERROR_GENERIC));
  }
};
