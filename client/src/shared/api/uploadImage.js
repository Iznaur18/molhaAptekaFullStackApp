import axios from "axios";

import { resolveUploadedImageUrl } from "../lib/resolveUploadedImageUrl.js";
import { API_BASE_URL } from "../config/apiBaseUrl.js";
import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";
import { AUTH_TOKEN_STORAGE_KEY } from "./apiClient.js";

const BEARER_PREFIX = "Bearer";

/**
 * `POST /upload` — загрузка изображения (Bearer, multipart, поле `image`).
 *
 * @param {File} file
 * @returns {Promise<string>} URL для сохранения и отображения
 */
export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

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
      `${API_BASE_URL || ""}/upload`,
      formData,
      { headers },
    );

    if (!data?.success || typeof data.data?.url !== "string") {
      throw new Error(IMAGE_URL_FIELD_UI.ERROR_GENERIC);
    }

    return resolveUploadedImageUrl(data.data.url);
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error(IMAGE_URL_FIELD_UI.ERROR_AUTH);
    }
    const message =
      error?.response?.data?.message ??
      (error instanceof Error ? error.message : IMAGE_URL_FIELD_UI.ERROR_GENERIC);
    throw new Error(message);
  }
}
