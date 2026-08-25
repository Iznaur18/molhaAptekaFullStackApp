const DEFAULT_PLAUSIBLE_API_HOST = "https://plausible.io";

export function getMobilePlausibleDomain(): string {
  return String(process.env.EXPO_PUBLIC_PLAUSIBLE_DOMAIN ?? "").trim();
}

export function isMobilePlausibleEnabled(): boolean {
  return getMobilePlausibleDomain().length > 0;
}

export function getMobilePlausibleApiHost(): string {
  const custom = String(process.env.EXPO_PUBLIC_PLAUSIBLE_API_HOST ?? "").trim();
  return (custom || DEFAULT_PLAUSIBLE_API_HOST).replace(/\/+$/, "");
}

/** Origin для URL pageview (домен сайта в Plausible). */
export function getMobilePlausibleUrlBase(): string {
  const custom = String(process.env.EXPO_PUBLIC_PLAUSIBLE_URL_BASE ?? "").trim();
  if (custom) {
    return custom.replace(/\/+$/, "");
  }
  const webApp = String(process.env.EXPO_PUBLIC_WEB_APP_URL ?? "").trim();
  return webApp.replace(/\/+$/, "") || "https://gitorg.ru";
}
