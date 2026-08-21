import { shouldProxyProductPathToApi } from "./productDetailsPaths.js";

/**
 * Dev/preview Vite proxy prefixes — sync with mounts in `server/createApp.js`.
 * `/uploads` before `/upload`.
 */
export const DEV_API_PROXY_PREFIXES = [
  "/auth",
  "/cart",
  "/favorites",
  "/user",
  "/vote",
  "/order",
  "/product",
  "/installment",
  "/price-offers",
  "/address",
  "/app-intro",
  "/users-loyalty-raffle",
  "/site-header-banner-campaign",
  "/site-header-banner",
  "/intro-ad",
  "/seller-personal-category",
  "/seller-shelf",
  "/audit",
  "/staff",
  "/onec",
  "/health",
  "/uploads",
  "/upload",
];

/**
 * Не проксировать SPA-пути вроде `/user-list` (префикс API — только `/user` и `/user/...`).
 * Важно: http-proxy матчит `/user` как prefix → `/users-loyalty-raffle` тоже попадает сюда.
 *
 * @param {string} prefix
 * @param {string} pathname
 * @param {string | undefined} [acceptHeader]
 */
export function shouldProxyToApi(prefix, pathname, acceptHeader) {
  if (prefix === "/user") {
    if (/^\/users-loyalty-raffle(?:\/|$)/.test(pathname)) {
      return true;
    }
    return /^\/user(?:\/|$)/.test(pathname);
  }
  if (prefix === "/site-header-banner") {
    return /^\/site-header-banner(?:\/|$)/.test(pathname);
  }
  if (prefix === "/product") {
    return shouldProxyProductPathToApi(pathname, acceptHeader);
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
