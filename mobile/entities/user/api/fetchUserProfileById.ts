import { apiClient, parseUserProfileByIdData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchUserProfileById = async (userId: string) => {
  try {
    const { data } = await apiClient.get(`/user/${encodeURIComponent(userId)}`);
    return parseUserProfileByIdData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_USER_PROFILE_FALLBACK));
  }
};
