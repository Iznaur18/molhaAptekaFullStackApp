import { Platform } from "react-native";

import { apiClient, parseUploadImageData } from "@/shared/api";
import { VIDEO_URL_FIELD_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { normalizeUploadUrlForStorage } from "@/shared/lib/normalizeUploadUrlForStorage";

export type UploadVideoFilePayload = {
  uri: string;
  name: string;
  type: string;
};

const appendVideoToFormData = async (
  formData: FormData,
  file: UploadVideoFilePayload,
): Promise<void> => {
  if (Platform.OS === "web") {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append("video", blob, file.name);
    return;
  }

  formData.append("video", file as unknown as Blob);
};

export const uploadVideo = async (file: UploadVideoFilePayload): Promise<string> => {
  try {
    const formData = new FormData();
    await appendVideoToFormData(formData, file);

    const { data } = await apiClient.post("/upload/video", formData, {
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
      throw new Error(VIDEO_URL_FIELD_UI.ERROR_AUTH);
    }
    throw new Error(formatApiErrorMessage(error, VIDEO_URL_FIELD_UI.ERROR_GENERIC));
  }
};
