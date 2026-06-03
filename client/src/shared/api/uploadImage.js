import axios from "axios";

import { resolveUploadedImageUrl } from "../lib/resolveUploadedImageUrl.js";
import { API_BASE_URL } from "../config/apiBaseUrl.js";
import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";

/**
 * `POST /upload` — загрузка изображения (cookie auth, multipart, поле `image`).
 *
 * @param {File} file
 * @returns {Promise<string>} URL для сохранения и отображения
 */
export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await axios.post(
      `${API_BASE_URL || ""}/upload`,
      formData,
      { withCredentials: true },
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
