import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type UserStoryReportGroup = {
  story: {
    _id: string;
    mediaType?: string;
    mediaUrl: string;
    captionText?: string;
  };
  author: { _id: string; userName?: string };
  reportCount: number;
  reports: Array<{
    _id: string;
    reportText: string;
    createdAt?: string;
    reporter: { _id: string; userName?: string };
  }>;
};

export const fetchPendingUserStoryReports = async () => {
  try {
    const { data } = await apiClient.get("/user/stories/reports/pending");
    if (!data?.success || !Array.isArray(data.data?.groups)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      groups: data.data.groups as UserStoryReportGroup[],
      totalReports: Number(data.data.totalReports) || 0,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить жалобы на сторисы"));
  }
};

export const resolveUserStoryReports = async (
  storyId: string,
  payload: { resolution: string; staffNote: string },
) => {
  try {
    const { data } = await apiClient.patch(
      `/user/stories/reports/story/${encodeURIComponent(storyId)}/resolve`,
      payload,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось обработать жалобы"));
  }
};
