/** Query-параметр инвайт-ссылки (`/register?ref=CODE`). */
export const REFERRAL_QUERY_PARAM = "ref";

/** Ключ хранения кода до регистрации (web localStorage / mobile AsyncStorage). */
export const REFERRAL_CODE_STORAGE_KEY = "izibuy_referral_code";

/**
 * @param {string | null | undefined} raw
 * @returns {string}
 */
export function normalizeReferralCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}
