import { apiClient } from "./apiClient.js";
import { postMultipart } from "@izibuy/shared-api";
import { formatApiErrorMessage, normalizeUploadUrlForStorage } from "@izibuy/shared-lib";
import { VIDEO_URL_FIELD_UI } from "../config/appUiCopy.js";

/**
 * `POST /upload/video` — загрузка видео (cookie auth, multipart, поле `video`).
 *
 * @param {File} file
 * @param {{ purpose?: 'intro' | 'story' | 'product-preview' }} [options]
 * @returns {Promise<string>}
 */
export async function uploadVideo(file, { purpose } = {}) {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const endpoint = purpose
      ? `/upload/video?purpose=${encodeURIComponent(purpose)}`
      : "/upload/video";

    /** @type {{ success?: boolean; data?: { url?: string } }} */
    const data = await postMultipart(apiClient, endpoint, formData);

    if (!data?.success || typeof data.data?.url !== "string") {
      throw new Error(VIDEO_URL_FIELD_UI.ERROR_GENERIC);
    }

    return normalizeUploadUrlForStorage(data.data.url);
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error(VIDEO_URL_FIELD_UI.ERROR_AUTH);
    }
    throw new Error(formatApiErrorMessage(error, VIDEO_URL_FIELD_UI.ERROR_GENERIC));
  }
}
