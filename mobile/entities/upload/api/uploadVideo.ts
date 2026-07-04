import { Platform } from "react-native";
import { postMultipart } from "@izibuy/shared-api";

import { apiClient, parseUploadImageData } from "@/shared/api";
import { VIDEO_URL_FIELD_UI } from "@/shared/config";
import { formatApiErrorMessage, normalizeUploadUrlForStorage } from "@/shared/lib";

export type UploadVideoFilePayload = {
  uri: string;
  name: string;
  type: string;
};

/** `POST /upload/video` — загрузка видео (cookie auth, multipart, поле `video`). */
export type UploadVideoPurpose = "intro" | "story" | "product-preview";

type UploadVideoOptions = {
  purpose?: UploadVideoPurpose;
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

export const uploadVideo = async (
  file: UploadVideoFilePayload,
  { purpose }: UploadVideoOptions = {},
): Promise<string> => {
  try {
    const formData = new FormData();
    await appendVideoToFormData(formData, file);

    const endpoint = purpose
      ? `/upload/video?purpose=${encodeURIComponent(purpose)}`
      : "/upload/video";
    const data = await postMultipart(apiClient, endpoint, formData);

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
