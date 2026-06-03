import { isPremiumActive } from "./isPremiumActive.js";

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @param {{ premiumExpiresAt?: string }} form
 */
export function willFormDisablePremium(user, form) {
  if (!isPremiumActive(user)) {
    return false;
  }
  const raw = String(form.premiumExpiresAt ?? "").trim();
  if (!raw) {
    return true;
  }
  const expiresAt = new Date(raw).getTime();
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}
