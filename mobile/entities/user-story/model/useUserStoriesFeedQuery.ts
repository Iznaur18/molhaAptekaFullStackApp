import { useQuery } from "@tanstack/react-query";

import { userStoriesQueryKeys } from "@/shared/api";

import { fetchUserStoriesFeed } from "../api/userStoryApi";

export const useUserStoriesFeedQuery = (enabled = true) =>
  useQuery({
    queryKey: userStoriesQueryKeys.feed(),
    queryFn: fetchUserStoriesFeed,
    enabled,
  });
