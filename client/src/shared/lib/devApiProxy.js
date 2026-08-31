import { shouldProxyProductPathToApi } from "./productDetailsPaths.js";
import { isLinkPreviewBotUserAgent } from "@izibuy/shared-lib";

/**
 * Dev/preview Vite proxy prefixes — sync with mounts in `server/createApp.js`.
 * `/uploads` before `/upload`.
 * `/seller` — только crawler UA (OG HTML), люди остаются на SPA.
 */
export const DEV_API_PROXY_PREFIXES = [
  "/auth",
  "/cart",
  "/favorites",
  "/user",
  "/vote",
  "/order",
  // Множественное число намеренно: SPA-роуты /become-courier и
  // /courier-moderation не должны попадать в прокси по префиксу.
  "/couriers",
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
  "/seller",
  "/audit",
  "/analytics",
  "/staff",
  "/onec",
  "/health",
  "/uploads",
  "/upload",
];

const SELLER_OG_PATH_RE = /^\/seller\/[a-f\d]{24}$/i;

/**
 * Не проксировать SPA-пути вроде `/user-list` (префикс API — только `/user` и `/user/...`).
 * Важно: http-proxy матчит `/user` как prefix → `/users-loyalty-raffle` тоже попадает сюда.
 *
 * @param {string} prefix
 * @param {string} pathname
 * @param {string | undefined} [acceptHeader]
 * @param {string | undefined} [userAgent]
 */
export function shouldProxyToApi(prefix, pathname, acceptHeader, userAgent) {
  if (prefix === "/seller") {
    return (
      isLinkPreviewBotUserAgent(userAgent) && SELLER_OG_PATH_RE.test(pathname)
    );
  }
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
    return shouldProxyProductPathToApi(pathname, acceptHeader, userAgent);
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
