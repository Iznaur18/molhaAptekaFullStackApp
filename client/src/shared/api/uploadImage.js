import { apiClient } from "./apiClient.js";
import { postMultipart } from "@izibuy/shared-api";
import { formatApiErrorMessage, normalizeUploadUrlForStorage } from "@izibuy/shared-lib";
import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";
import { prepareBrowserImageFileForUpload } from "../lib/prepareBrowserImageFileForUpload.js";

/**
 * `POST /upload` — загрузка изображения (cookie auth, multipart, поле `image`).
 * Перед отправкой файл автоматически сжимается под целевой размер
 * (повторный вызов для уже сжатого файла — no-op).
 *
 * @param {File} file
 * @returns {Promise<string>} URL для сохранения и отображения
 */
export async function uploadImage(file, purpose) {
  try {
    const preparedFile = await prepareBrowserImageFileForUpload(file);
    const formData = new FormData();
    formData.append("image", preparedFile);

    const path =
      purpose != null && String(purpose).trim() !== ""
        ? `/upload?purpose=${encodeURIComponent(String(purpose).trim())}`
        : "/upload";

    /** @type {{ success?: boolean; data?: { url?: string } }} */
    const data = await postMultipart(apiClient, path, formData);

    if (!data?.success || typeof data.data?.url !== "string") {
      throw new Error(IMAGE_URL_FIELD_UI.ERROR_GENERIC);
    }

    return normalizeUploadUrlForStorage(data.data.url);
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error(IMAGE_URL_FIELD_UI.ERROR_AUTH);
    }
    throw new Error(formatApiErrorMessage(error, IMAGE_URL_FIELD_UI.ERROR_GENERIC));
  }
}
