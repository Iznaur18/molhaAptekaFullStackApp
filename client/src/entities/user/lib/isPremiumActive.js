/**
 * @param {{ isPremiumUser?: boolean; premiumExpiresAt?: string | Date | null } | null | undefined} user
 */
export function isPremiumActive(user) {
  if (!user || user.isPremiumUser !== true) {
    return false;
  }
  const expiresAt = user.premiumExpiresAt;
  if (!expiresAt) {
    return true;
  }
  return new Date(expiresAt).getTime() > Date.now();
}
