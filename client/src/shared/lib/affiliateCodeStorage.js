import {
  AFFILIATE_CLICK_TTL_DAYS,
  AFFILIATE_CODE_STORAGE_KEY,
  AFFILIATE_QUERY_PARAM,
  normalizeAffiliateCode,
} from "@izibuy/shared-lib";

export {
  AFFILIATE_CLICK_TTL_DAYS,
  AFFILIATE_CODE_STORAGE_KEY,
  AFFILIATE_QUERY_PARAM,
  normalizeAffiliateCode,
};

/**
 * @param {string} code
 */
export function persistAffiliateCode(code) {
  const normalized = normalizeAffiliateCode(code);
  if (!normalized || typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      AFFILIATE_CODE_STORAGE_KEY,
      JSON.stringify({ code: normalized, savedAt: Date.now() }),
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @returns {string}
 */
export function readPersistedAffiliateCode() {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const raw = window.localStorage.getItem(AFFILIATE_CODE_STORAGE_KEY);
    if (!raw) {
      return "";
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return normalizeAffiliateCode(raw);
    }
    const code = normalizeAffiliateCode(parsed?.code);
    const savedAt = Number(parsed?.savedAt) || 0;
    const ttlMs = AFFILIATE_CLICK_TTL_DAYS * 24 * 60 * 60 * 1000;
    if (!code || !savedAt || Date.now() - savedAt > ttlMs) {
      clearPersistedAffiliateCode();
      return "";
    }
    return code;
  } catch {
    return "";
  }
}

export function clearPersistedAffiliateCode() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(AFFILIATE_CODE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Читает `?aff=` из URL и сохраняет last-click.
 *
 * @param {string} [search]
 */
export function captureAffiliateCodeFromSearch(search) {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const params = new URLSearchParams(search ?? window.location.search);
    const code = normalizeAffiliateCode(params.get(AFFILIATE_QUERY_PARAM));
    if (code) {
      persistAffiliateCode(code);
    }
    return code;
  } catch {
    return "";
  }
}
