import {
  getMobilePlausibleApiHost,
  getMobilePlausibleDomain,
  getMobilePlausibleUrlBase,
  isMobilePlausibleEnabled,
} from "./plausibleEnv";

/**
 * Pageview через Plausible Events API (без cookies).
 * Ошибки глотаем: аналитика не должна ломать UX.
 */
export async function trackMobilePlausiblePageview(pathname: string): Promise<void> {
  if (!isMobilePlausibleEnabled()) {
    return;
  }

  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = `${getMobilePlausibleUrlBase()}${path}`;
  const domain = getMobilePlausibleDomain();
  const endpoint = `${getMobilePlausibleApiHost()}/api/event`;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        n: "pageview",
        u: url,
        d: domain,
      }),
    });
  } catch {
    // traffic analytics must not break navigation
  }
}
