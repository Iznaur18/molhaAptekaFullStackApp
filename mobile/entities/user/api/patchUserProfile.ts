import { apiClient, parsePatchUserProfileData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const patchUserProfile = async (
  userId: string,
  body: Record<string, unknown>,
) => {
  try {
    const { data } = await apiClient.patch(`/user/${encodeURIComponent(userId)}`, body);
    return parsePatchUserProfileData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_PROFILE_FALLBACK));
  }
};
