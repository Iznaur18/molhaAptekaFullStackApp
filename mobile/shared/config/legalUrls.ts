const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

export const PRIVACY_POLICY_URL = (() => {
  const fromEnv = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
  if (!fromEnv) {
    return "";
  }
  return trimTrailingSlash(fromEnv);
})();
