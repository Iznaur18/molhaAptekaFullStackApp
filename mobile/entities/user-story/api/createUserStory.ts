import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { UserStoryMediaType } from "../model/constants";

export type CreateUserStoryPayload = {
  mediaType: UserStoryMediaType;
  mediaUrl: string;
  captionText?: string;
};

export const createUserStory = async (payload: CreateUserStoryPayload) => {
  try {
    const { data } = await apiClient.post("/user/stories", payload);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось опубликовать сторис"));
  }
};
