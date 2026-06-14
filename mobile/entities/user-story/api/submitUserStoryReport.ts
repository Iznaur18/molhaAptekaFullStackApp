import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type SubmitUserStoryReportPayload = {
  reportText: string;
};

export const submitUserStoryReport = async (
  storyId: string,
  payload: SubmitUserStoryReportPayload,
) => {
  const normalizedStoryId = String(storyId ?? "").trim();
  if (!normalizedStoryId) {
    throw new Error("Не удалось определить сторис");
  }

  try {
    const { data } = await apiClient.post(
      `/user/stories/${encodeURIComponent(normalizedStoryId)}/report`,
      payload,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отправить жалобу"));
  }
};
