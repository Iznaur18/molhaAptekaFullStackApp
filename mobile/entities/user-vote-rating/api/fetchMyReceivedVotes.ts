import { USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT } from "@molha/api-contract";

import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";

export type ReceivedVoteItem = {
  voteId: string;
  score: number;
  voter?: {
    _id?: string;
    userName?: string;
    userProfilePhotoUrl?: string;
  } | null;
};

export type MyReceivedVotesPage = {
  votes: ReceivedVoteItem[];
  summary: {
    countVotes: number;
    totalRating: number;
    averageRating: number;
  };
  pagination?: {
    page?: number;
    totalPages?: number;
  };
};

/** `GET /vote/me/received` */
export async function fetchMyReceivedVotes({
  page = 1,
  limit = USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<MyReceivedVotesPage> {
  try {
    const { data } = await apiClient.get("/vote/me/received", {
      params: { page, limit },
    });

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      votes: data.data.votes ?? [],
      summary: data.data.summary ?? {
        countVotes: 0,
        totalRating: 0,
        averageRating: 0,
      },
      pagination: data.data.pagination,
    };
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(
      err?.response?.data?.message ??
        err?.message ??
        API_CLIENT_UI.FETCH_MY_RECEIVED_VOTES_FALLBACK,
    );
  }
}
