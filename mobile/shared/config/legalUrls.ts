const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

const resolveLegalUrl = (envValue: string | undefined) => {
  const trimmed = envValue?.trim();
  if (!trimmed) {
    return "";
  }
  return trimTrailingSlash(trimmed);
};

export const PRIVACY_POLICY_URL = resolveLegalUrl(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL);

export const USER_AGREEMENT_URL = resolveLegalUrl(process.env.EXPO_PUBLIC_USER_AGREEMENT_URL);

export const PRODUCT_LISTING_RULES_URL = resolveLegalUrl(
  process.env.EXPO_PUBLIC_PRODUCT_LISTING_RULES_URL,
);

export const PUBLIC_OFFER_URL = resolveLegalUrl(process.env.EXPO_PUBLIC_PUBLIC_OFFER_URL);
