import { useQuery } from "@tanstack/react-query";

import { fetchUserStoriesByAuthor } from "../api/fetchUserStoriesByAuthor.js";
import { userStoriesQueryKeys } from "./userStoriesQueryKeys.js";

/**
 * @param {{ authorId: string; enabled?: boolean }} params
 */
export function useUserStoriesByAuthorQuery({ authorId, enabled = true }) {
  return useQuery({
    queryKey: userStoriesQueryKeys.byAuthor(authorId),
    enabled: enabled && Boolean(authorId),
    queryFn: () => fetchUserStoriesByAuthor(authorId),
  });
}
