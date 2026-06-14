import { useQuery } from "@tanstack/react-query";

import { userStoriesQueryKeys } from "@/shared/api";

import { fetchUserStoriesByAuthor } from "../api/userStoryApi";

export const useUserStoriesByAuthorQuery = (authorId: string | null, enabled = true) =>
  useQuery({
    queryKey: userStoriesQueryKeys.author(authorId ?? ""),
    queryFn: () => fetchUserStoriesByAuthor(authorId ?? ""),
    enabled: Boolean(authorId) && enabled,
  });
