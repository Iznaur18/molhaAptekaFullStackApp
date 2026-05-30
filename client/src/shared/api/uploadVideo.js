import axios from "axios";

import { resolveUploadedImageUrl } from "../lib/resolveUploadedImageUrl.js";
import { API_BASE_URL } from "../config/apiBaseUrl.js";
import { VIDEO_URL_FIELD_UI } from "../config/appUiCopy.js";
import { AUTH_TOKEN_STORAGE_KEY } from "./apiClient.js";

const BEARER_PREFIX = "Bearer";

/**
 * `POST /upload/video` — загрузка видео (Bearer, multipart, поле `video`).
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadVideo(file) {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const headers = {};
    try {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (token) {
        headers.Authorization = `${BEARER_PREFIX} ${token}`;
      }
    } catch {
      // storage недоступен
    }

    const { data } = await axios.post(
      `${API_BASE_URL || ""}/upload/video`,
      formData,
      { headers },
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
