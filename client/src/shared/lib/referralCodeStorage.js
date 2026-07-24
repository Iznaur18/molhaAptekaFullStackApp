import {
  REFERRAL_CODE_STORAGE_KEY,
  REFERRAL_QUERY_PARAM,
  normalizeReferralCode,
} from "@izibuy/shared-lib";

export { REFERRAL_CODE_STORAGE_KEY, REFERRAL_QUERY_PARAM, normalizeReferralCode };

/**
 * @param {string} code
 */
export function persistReferralCode(code) {
  const normalized = normalizeReferralCode(code);
  if (!normalized || typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, normalized);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @returns {string}
 */
export function readPersistedReferralCode() {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return normalizeReferralCode(
      window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY),
    );
  } catch {
    return "";
  }
}

export function clearPersistedReferralCode() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Читает `?ref=` из URL и сохраняет в localStorage.
 *
 * @param {string} [search]
 */
export function captureReferralCodeFromSearch(search) {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const params = new URLSearchParams(search ?? window.location.search);
    const code = normalizeReferralCode(params.get(REFERRAL_QUERY_PARAM));
    if (code) {
      persistReferralCode(code);
    }
    return code;
  } catch {
    return "";
  }
}
