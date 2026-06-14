type PremiumUserRef = {
  isPremiumUser?: boolean;
  premiumExpiresAt?: string | Date | null;
} | null | undefined;

export const isPremiumActive = (user: PremiumUserRef): boolean => {
  if (!user || user.isPremiumUser !== true) {
    return false;
  }

  const expiresAt = user.premiumExpiresAt;
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() > Date.now();
};
