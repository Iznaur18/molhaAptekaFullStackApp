import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const deleteUserStory = async (storyId: string) => {
  const normalizedStoryId = String(storyId ?? "").trim();
  if (!normalizedStoryId) {
    throw new Error("Не удалось определить сторис");
  }

  try {
    const { data } = await apiClient.delete(
      `/user/stories/${encodeURIComponent(normalizedStoryId)}`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось удалить сторис"));
  }
};
