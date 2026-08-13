const PRODUCT_PATH_RE = /\/product\/([^/?#]+)/i;
const RAFFLE_PATH_RE = /\/raffle\/([^/?#]+)/i;
const SELLER_PATH_RE = /\/seller\/([^/?#]+)/i;
const USER_PROFILE_PATH_RE = /^\/user\/([^/?#]+)$/i;
const HUB_PATH_RE = /\/hub\/([^/?#]+)/i;

const RESERVED_USER_PATH_SEGMENTS = new Set(["search", "me", "data-confirmation-requests"]);

const normalizePath = (rawPath: string): string => {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return "/";
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const matchNamedRoute = (pathname: string): string | null => {
  const productMatch = pathname.match(PRODUCT_PATH_RE);
  if (productMatch?.[1]) {
    return `/product/${decodeURIComponent(productMatch[1])}`;
  }

  const raffleMatch = pathname.match(RAFFLE_PATH_RE);
  if (raffleMatch?.[1]) {
    return `/raffle/${decodeURIComponent(raffleMatch[1])}`;
  }

  const sellerMatch = pathname.match(SELLER_PATH_RE);
  if (sellerMatch?.[1]) {
    return `/seller/${decodeURIComponent(sellerMatch[1])}`;
  }

  const userMatch = pathname.match(USER_PROFILE_PATH_RE);
  if (userMatch?.[1]) {
    const userId = decodeURIComponent(userMatch[1]);
    if (!RESERVED_USER_PATH_SEGMENTS.has(userId)) {
      return `/user/${userId}`;
    }
  }

  const hubMatch = pathname.match(HUB_PATH_RE);
  if (hubMatch?.[1]) {
    return `/hub/${decodeURIComponent(hubMatch[1])}`;
  }

  if (pathname === "/orders" || pathname.startsWith("/orders/")) {
    return "/orders";
  }

  if (pathname === "/notifications" || pathname.startsWith("/notifications/")) {
    return "/notifications";
  }

  if (pathname === "/catalog" || pathname === "/catalog-browser") {
    return "/catalog-browser";
  }

  if (pathname === "/user-list" || pathname === "/users") {
    return "/users";
  }

  if (pathname === "/login") {
    return "/(auth)/login";
  }

  if (pathname === "/register") {
    return "/(auth)/register";
  }

  if (pathname === "/" || pathname === "/(tabs)") {
    return "/(tabs)";
  }

  return null;
};

export const parseAppDeepLink = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(":", "");
    if (scheme === "torgum" || scheme === "izibuy") {
      const hostPath = parsed.hostname
        ? `/${parsed.hostname}${parsed.pathname}`
        : parsed.pathname;
      return matchNamedRoute(normalizePath(hostPath));
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host === "torgum.ru" ||
      host === "www.torgum.ru" ||
      host === "izibuy.ru" ||
      host === "www.izibuy.ru"
    ) {
      return matchNamedRoute(normalizePath(parsed.pathname));
    }
  } catch {
    const normalized = normalizePath(
      url.replace(/^(?:torgum|izibuy):\/\//i, "/"),
    );
    return matchNamedRoute(normalized);
  }

  return null;
};
