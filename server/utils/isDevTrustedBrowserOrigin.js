/**
 * Dev/LAN browser Origin: loopback + RFC1918 private IPv4.
 * Production must never use this — only explicit FRONTEND_URL allowlist.
 *
 * @param {string | null | undefined} origin
 * @returns {boolean}
 */
export function isDevTrustedBrowserOrigin(origin) {
  if (!origin || typeof origin !== "string") {
    return false;
  }

  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1") {
    return true;
  }

  // IPv4 only — private ranges for phone/LAN Vite (:5173 / :4173).
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!ipv4) {
    return false;
  }

  const octets = ipv4.slice(1).map((part) => Number(part));
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  // link-local (часто APIPA) — не для прод-траста, в LAN-dev иногда встречается
  if (a === 169 && b === 254) return true;

  return false;
}
