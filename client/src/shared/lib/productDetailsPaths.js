/**
 * SPA-страница деталей товара: `/product/:productId` (Mongo ObjectId).
 * Не путать с API-префиксом `/product/...` (прокси Vite / nginx → Express).
 *
 * Document navigation (Accept: text/html) → SPA;
 * XHR/fetch (Accept: application/json, PATCH/DELETE, …) → API.
 */

import { isHtmlDocumentAccept } from "./userProfilePaths.js";
import { isLinkPreviewBotUserAgent } from "@izibuy/shared-lib";

/** Только 24 hex — как `mongoIdSchema` в `@molha/api-contract`. */
const PRODUCT_DETAILS_PATH_RE = /^\/product\/([a-f\d]{24})$/i;

/**
 * @param {string} pathname
 * @returns {string | null}
 */
export function parseProductIdFromPathname(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = normalized.match(PRODUCT_DETAILS_PATH_RE);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * @param {string} pathname
 */
export function isProductDetailsPath(pathname) {
  return parseProductIdFromPathname(pathname) != null;
}

/**
 * Document navigation → SPA; API client → proxy (как `shouldServeUserProfileAsSpa`).
 * Crawler UA → не SPA (нужен OG HTML с API).
 * @param {string} pathname
 * @param {string | undefined} acceptHeader
 * @param {string | undefined} [userAgent]
 */
export function shouldServeProductDetailsAsSpa(pathname, acceptHeader, userAgent) {
  if (isLinkPreviewBotUserAgent(userAgent)) {
    return false;
  }
  return isProductDetailsPath(pathname) && isHtmlDocumentAccept(acceptHeader);
}

/**
 * Dev/preview proxy (Vite): true → API, false → `index.html` (SPA).
 * Без Accept — всегда API (XHR/axios), чтобы PATCH `/product/:id` не ловил SPA.
 * @param {string} pathname
 * @param {string | undefined} [acceptHeader]
 * @param {string | undefined} [userAgent]
 */
export function shouldProxyProductPathToApi(pathname, acceptHeader, userAgent) {
  if (pathname === "/product") {
    return true;
  }
  if (!pathname.startsWith("/product/")) {
    return false;
  }
  if (shouldServeProductDetailsAsSpa(pathname, acceptHeader, userAgent)) {
    return false;
  }
  return true;
}
