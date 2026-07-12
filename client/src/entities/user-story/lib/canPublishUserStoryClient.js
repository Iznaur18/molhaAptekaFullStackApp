import { isPremiumActive } from "../../user/lib/isPremiumActive.js";

/**
 * Публиковать сторис могут только пользователи с активным премиумом.
 * Заблокированным пользователям публикация недоступна.
 *
 * @param {{
 *   isBlockedUser?: boolean;
 *   isPremiumUser?: boolean;
 *   premiumExpiresAt?: string | Date | null;
 * } | null | undefined} user
 */
export function canPublishUserStoryClient(user) {
  if (!user || user.isBlockedUser === true) {
    return false;
  }
  return isPremiumActive(user);
}
