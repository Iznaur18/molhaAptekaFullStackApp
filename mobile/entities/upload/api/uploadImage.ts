import { apiClient, parseUploadImageData } from "@/shared/api";
import { IMAGE_UPLOAD_UI } from "@/shared/config";
import { normalizeUploadUrlForStorage } from "@/shared/lib/normalizeUploadUrlForStorage";
import { formatApiErrorMessage } from "@/shared/lib";

export type UploadImageFilePayload = {
  uri: string;
  name: string;
  type: string;
};

export const uploadImage = async (file: UploadImageFilePayload): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file as unknown as Blob);

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
