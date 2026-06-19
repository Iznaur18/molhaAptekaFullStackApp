/**
 * @param {{ isBlockedUser?: boolean } | null | undefined} user
 */
export function canPublishUserStoryClient(user) {
  return Boolean(user && user.isBlockedUser !== true);
}
