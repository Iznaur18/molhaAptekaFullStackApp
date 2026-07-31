import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "izibuy_access_token";
const REFRESH_TOKEN_KEY = "izibuy_refresh_token";
/** Native only — Expo web идёт через httpOnly cookies (как client prod). */
const USE_SECURE_STORE = Platform.OS !== "web";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const scrubLegacyWebTokenStorage = (): void => {
  if (Platform.OS !== "web") {
    return;
  }
  try {
    for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]) {
      globalThis.sessionStorage?.removeItem(key);
      globalThis.localStorage?.removeItem(key);
    }
  } catch {
    // storage недоступен
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (!USE_SECURE_STORE) {
      scrubLegacyWebTokenStorage();
      return null;
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (!USE_SECURE_STORE) {
      scrubLegacyWebTokenStorage();
      return null;
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    if (!USE_SECURE_STORE) {
      scrubLegacyWebTokenStorage();
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Не удалось сохранить сессию");
  }
};

export const clearAuthTokens = async (): Promise<void> => {
  try {
    if (!USE_SECURE_STORE) {
      scrubLegacyWebTokenStorage();
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // storage недоступен
  }
};

/** Expo web: cookie-сессия, без Bearer в JS storage. */
export const isCookieAuthWeb = (): boolean => Platform.OS === "web";
