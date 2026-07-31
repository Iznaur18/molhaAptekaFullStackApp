import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
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

const USE_WEB_STORAGE = Platform.OS === "web";

const webGet = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const webSet = (key: string, value: string): void => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // ignore
  }
};

const webDelete = (key: string): void => {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // ignore
  }
};

type StoredAffiliate = { code: string; savedAt: number };

export const persistAffiliateCode = async (code: string): Promise<void> => {
  const normalized = normalizeAffiliateCode(code);
  if (!normalized) {
    return;
  }
  const payload = JSON.stringify({
    code: normalized,
    savedAt: Date.now(),
  } satisfies StoredAffiliate);
  try {
    if (USE_WEB_STORAGE) {
      webSet(AFFILIATE_CODE_STORAGE_KEY, payload);
      return;
    }
    await SecureStore.setItemAsync(AFFILIATE_CODE_STORAGE_KEY, payload);
  } catch {
    // ignore
  }
};

export const readPersistedAffiliateCode = async (): Promise<string> => {
  try {
    const raw = USE_WEB_STORAGE
      ? webGet(AFFILIATE_CODE_STORAGE_KEY)
      : await SecureStore.getItemAsync(AFFILIATE_CODE_STORAGE_KEY);
    if (!raw) {
      return "";
    }
    let parsed: StoredAffiliate | null = null;
    try {
      parsed = JSON.parse(raw) as StoredAffiliate;
    } catch {
      return normalizeAffiliateCode(raw);
    }
    const code = normalizeAffiliateCode(parsed?.code);
    const savedAt = Number(parsed?.savedAt) || 0;
    const ttlMs = AFFILIATE_CLICK_TTL_DAYS * 24 * 60 * 60 * 1000;
    if (!code || !savedAt || Date.now() - savedAt > ttlMs) {
      await clearPersistedAffiliateCode();
      return "";
    }
    return code;
  } catch {
    return "";
  }
};

export const clearPersistedAffiliateCode = async (): Promise<void> => {
  try {
    if (USE_WEB_STORAGE) {
      webDelete(AFFILIATE_CODE_STORAGE_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(AFFILIATE_CODE_STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const captureAffiliateCodeFromUrl = async (url: string): Promise<string> => {
  try {
    const parsed = new URL(url);
    const code = normalizeAffiliateCode(
      parsed.searchParams.get(AFFILIATE_QUERY_PARAM),
    );
    if (code) {
      await persistAffiliateCode(code);
    }
    return code;
  } catch {
    return "";
  }
};
