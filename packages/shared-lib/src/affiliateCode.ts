/** Query-параметр партнёрской ссылки на товар (`/product/:id?aff=CODE`). */
export const AFFILIATE_QUERY_PARAM = "aff";

/** Ключ localStorage last-click attribution. */
export const AFFILIATE_CODE_STORAGE_KEY = "izibuy_affiliate_code";

/** TTL клика в днях (синхрон с contract / server). */
export const AFFILIATE_CLICK_TTL_DAYS = 14;

/**
 * @param {string | null | undefined} raw
 * @returns {string}
 */
export function normalizeAffiliateCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}
