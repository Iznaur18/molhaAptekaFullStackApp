import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { UserProfileThumbItem } from "../model/userProfileThumbTypes";

export const fetchUserPurchases = async (userId: string): Promise<UserProfileThumbItem[]> => {
  try {
    const { data } = await apiClient.get(`/user/${encodeURIComponent(userId)}/purchases`);

    if (
      !data ||
      typeof data !== "object" ||
      !("success" in data) ||
      !(data as { success?: boolean }).success ||
      !("data" in data) ||
      typeof (data as { data?: unknown }).data !== "object" ||
      (data as { data?: { items?: unknown } }).data?.items == null ||
      !Array.isArray((data as { data: { items: unknown[] } }).data.items)
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return (data as { data: { items: UserProfileThumbItem[] } }).data.items;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_USER_PURCHASES_FALLBACK));
  }
};
