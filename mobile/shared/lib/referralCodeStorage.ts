import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  REFERRAL_CODE_STORAGE_KEY,
  REFERRAL_QUERY_PARAM,
  normalizeReferralCode,
} from "@izibuy/shared-lib";

export { REFERRAL_CODE_STORAGE_KEY, REFERRAL_QUERY_PARAM, normalizeReferralCode };

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
    // ignore quota / private mode
  }
};

const webDelete = (key: string): void => {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // storage недоступен
  }
};

export const persistReferralCode = async (code: string): Promise<void> => {
  const normalized = normalizeReferralCode(code);
  if (!normalized) {
    return;
  }
  try {
    if (USE_WEB_STORAGE) {
      webSet(REFERRAL_CODE_STORAGE_KEY, normalized);
      return;
    }
    await SecureStore.setItemAsync(REFERRAL_CODE_STORAGE_KEY, normalized);
  } catch {
    // ignore
  }
};

export const readPersistedReferralCode = async (): Promise<string> => {
  try {
    const raw = USE_WEB_STORAGE
      ? webGet(REFERRAL_CODE_STORAGE_KEY)
      : await SecureStore.getItemAsync(REFERRAL_CODE_STORAGE_KEY);
    return normalizeReferralCode(raw);
  } catch {
    return "";
  }
};

export const clearPersistedReferralCode = async (): Promise<void> => {
  try {
    if (USE_WEB_STORAGE) {
      webDelete(REFERRAL_CODE_STORAGE_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(REFERRAL_CODE_STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const captureReferralCodeFromUrl = async (url: string): Promise<string> => {
  try {
    const parsed = new URL(url);
    const code = normalizeReferralCode(
      parsed.searchParams.get(REFERRAL_QUERY_PARAM),
    );
    if (code) {
      await persistReferralCode(code);
    }
    return code;
  } catch {
    return "";
  }
};
