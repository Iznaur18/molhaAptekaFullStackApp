import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMyVoteForTarget = async (targetUserId: string): Promise<number | null> => {
  try {
    const { data } = await apiClient.get(`/vote/me/${encodeURIComponent(targetUserId)}`);

    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const raw = data.data.myVoteValue;
    if (raw == null) {
      return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_VOTE_FALLBACK));
  }
};
