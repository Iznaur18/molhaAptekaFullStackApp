import { USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT } from "@molha/api-contract";
import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMyReceivedVotes } from "@/entities/user-vote-rating/api/fetchMyReceivedVotes";
import { userVoteQueryKeys } from "@/entities/user-vote-rating/model/userVoteQueryKeys";

export function useMyReceivedVotesInfiniteQuery({
  limit = USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT,
  enabled = true,
}: {
  limit?: number;
  enabled?: boolean;
} = {}) {
  const params = { limit };

  return useInfiniteQuery({
    queryKey: userVoteQueryKeys.receivedInfinite(params),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchMyReceivedVotes({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) {
        return undefined;
      }
      const page = Number(pagination.page) || 1;
      const totalPages = Number(pagination.totalPages) || 0;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
