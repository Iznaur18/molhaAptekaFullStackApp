import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const submitUserVoteRating = async (targetUserId: string, userVoteValueClient: number) => {
  try {
    const { data } = await apiClient.post(`/vote/${encodeURIComponent(targetUserId)}`, {
      userVoteValueClient,
    });

    if (!data?.success || data.data?.user == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      user: data.data.user as Record<string, unknown>,
      message: data.data.message as string | undefined,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.VOTE_SUBMIT_FALLBACK));
  }
};
