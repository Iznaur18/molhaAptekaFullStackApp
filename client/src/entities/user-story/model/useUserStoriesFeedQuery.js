import { useQuery } from "@tanstack/react-query";

import { fetchUserStoriesFeed } from "../api/fetchUserStoriesFeed.js";
import { userStoriesQueryKeys } from "./userStoriesQueryKeys.js";

const EMPTY_FEED = {
  rings: [],
  canPublish: false,
  showStrip: false,
};

/**
 * @param {{ enabled: boolean }} params
 */
export function useUserStoriesFeedQuery({ enabled }) {
  const query = useQuery({
    queryKey: userStoriesQueryKeys.feed(),
    enabled,
    queryFn: fetchUserStoriesFeed,
  });

  const userStoriesFeed = query.data ?? EMPTY_FEED;

  return {
    query,
    userStoriesFeed,
  };
}
