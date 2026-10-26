import { userStoriesByAuthorDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";

export type UserStoryRing = {
  author: { _id: string; userName?: string; userAvatarUrl?: string | null };
  isOwn?: boolean;
  isViewed?: boolean;
  activeCount?: number;
  latestPublishedAt?: string | null;
};

export type UserStoriesFeed = {
  rings: UserStoryRing[];
  canPublish: boolean;
  showStrip: boolean;
};

export type UserStory = {
  _id: string;
  mediaUrl: string;
  mediaType?: string;
  captionText?: string | null;
  /** Только у автора своего сторис. */
  viewsCount?: number;
};

export const fetchUserStoriesFeed = async (): Promise<UserStoriesFeed> => {
  try {
    const { data } = await apiClient.get("/user/stories/feed");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      rings: Array.isArray(data.data.rings) ? data.data.rings : [],
      canPublish: Boolean(data.data.canPublish),
      showStrip: Boolean(data.data.showStrip),
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить сторисы"));
  }
};

export const fetchUserStoriesByAuthor = async (
  authorUserId: string,
): Promise<UserStory[]> => {
  try {
    const { data } = await apiClient.get(
      `/user/stories/author/${encodeURIComponent(authorUserId)}`,
    );
    return parseApiContractData(data, userStoriesByAuthorDataSchema).stories;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить сторисы автора"),
    );
  }
};

export const markUserStoryViewed = async (storyId: string) => {
  try {
    await apiClient.post(`/user/stories/${encodeURIComponent(storyId)}/view`);
  } catch (error) {
    /* non-critical */
    reportClientIssue("userStoryApi", error);
  }
};
