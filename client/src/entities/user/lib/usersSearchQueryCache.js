import { usersSearchQueryKeys } from "../model/usersSearchQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateUsersSearch(queryClient) {
  await queryClient.invalidateQueries({ queryKey: usersSearchQueryKeys.all });
}
