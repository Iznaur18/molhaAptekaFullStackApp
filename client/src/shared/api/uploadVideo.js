import axios from "axios";

import { resolveUploadedImageUrl } from "../lib/resolveUploadedImageUrl.js";
import { API_BASE_URL } from "../config/apiBaseUrl.js";
import { VIDEO_URL_FIELD_UI } from "../config/appUiCopy.js";

/**
 * `POST /upload/video` — загрузка видео (cookie auth, multipart, поле `video`).
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadVideo(file) {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const { data } = await axios.post(
      `${API_BASE_URL || ""}/upload/video`,
      formData,
      { withCredentials: true },
    );

    if (!data?.success || typeof data.data?.url !== "string") {
      throw new Error(VIDEO_URL_FIELD_UI.ERROR_GENERIC);
    }

    return resolveUploadedImageUrl(data.data.url);
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error(VIDEO_URL_FIELD_UI.ERROR_AUTH);
    }
    const message =
      error?.response?.data?.message ??
      (error instanceof Error ? error.message : VIDEO_URL_FIELD_UI.ERROR_GENERIC);
    throw new Error(message);
  }
}
