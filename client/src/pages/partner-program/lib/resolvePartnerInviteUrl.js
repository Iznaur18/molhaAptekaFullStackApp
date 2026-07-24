import { REFERRAL_QUERY_PARAM } from "@izibuy/shared-lib";

/**
 * Инвайт-ссылка для текущего origin (LAN/localhost/prod), не из склейки FRONTEND_URL.
 *
 * @param {string} referralCode
 * @param {string} [fallbackInviteUrl]
 * @returns {string}
 */
export function resolvePartnerInviteUrl(referralCode, fallbackInviteUrl = "") {
  const code = String(referralCode ?? "").trim();
  if (!code) {
    return String(fallbackInviteUrl ?? "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/register?${REFERRAL_QUERY_PARAM}=${encodeURIComponent(code)}`;
  }

  return String(fallbackInviteUrl ?? "");
}
