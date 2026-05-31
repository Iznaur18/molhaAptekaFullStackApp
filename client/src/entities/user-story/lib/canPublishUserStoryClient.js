import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
} from "../../user/model/userConstants.js";

/**
 * @param {{
 *   isPremiumUser?: boolean;
 *   userRole?: string;
 * } | null | undefined} user
 */
export function canPublishUserStoryClient(user) {
  if (!user) {
    return false;
  }

  if (
    user.userRole === USER_ROLE_ADMIN ||
    user.userRole === USER_ROLE_MODERATOR
  ) {
    return true;
  }

  return Boolean(user.isPremiumUser);
}
