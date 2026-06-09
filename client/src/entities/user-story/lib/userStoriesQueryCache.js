import { userStoriesQueryKeys } from "../model/userStoriesQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateUserStoriesFeed(queryClient) {
  await queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.feed() });
}
