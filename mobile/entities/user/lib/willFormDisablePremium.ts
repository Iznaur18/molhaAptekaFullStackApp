import { isPremiumActive } from "./isPremiumActive";

type PremiumFormSlice = {
  premiumExpiresAt?: string;
};

export const willFormDisablePremium = (
  user: Record<string, unknown> | null | undefined,
  form: PremiumFormSlice,
): boolean => {
  if (!isPremiumActive(user)) {
    return false;
  }
  const raw = String(form.premiumExpiresAt ?? "").trim();
  if (!raw) {
    return true;
  }
  const expiresAt = new Date(raw).getTime();
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
};
