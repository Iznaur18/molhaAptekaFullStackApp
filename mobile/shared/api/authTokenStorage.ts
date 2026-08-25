import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "izibuy_access_token";
const REFRESH_TOKEN_KEY = "izibuy_refresh_token";
/** Паритет client `devAuthTokenStorage.js` (Vite DEV / Expo web DEV). */
const DEV_ACCESS_TOKEN_KEY = "dev_access_token";
const DEV_REFRESH_TOKEN_KEY = "dev_refresh_token";

const USE_SECURE_STORE = Platform.OS !== "web";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Expo web + Vite DEV: Bearer в sessionStorage.
 * Cookie `localhost` ↔ `127.0.0.1` / LAN IP часто не живут (LAN-dev-access.md).
 */
export const isWebDevBearerAuth = (): boolean => Platform.OS === "web" && __DEV__;

/** Prod Expo web: только httpOnly cookies, без JWT в JS storage. */
export const isCookieAuthWeb = (): boolean => Platform.OS === "web" && !__DEV__;

const readSessionToken = (key: string): string | null => {
  try {
    const token = globalThis.sessionStorage?.getItem(key);
    return token?.trim() ? token.trim() : null;
  } catch {
    return null;
  }
};

const writeSessionToken = (key: string, value: string): void => {
  try {
    globalThis.sessionStorage?.setItem(key, value);
  } catch {
    // sessionStorage недоступен
  }
};

const removeSessionToken = (key: string): void => {
  try {
    globalThis.sessionStorage?.removeItem(key);
  } catch {
    // sessionStorage недоступен
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (isWebDevBearerAuth()) {
      return readSessionToken(DEV_ACCESS_TOKEN_KEY);
    }
    if (!USE_SECURE_STORE) {
      return null;
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (isWebDevBearerAuth()) {
      return readSessionToken(DEV_REFRESH_TOKEN_KEY);
    }
    if (!USE_SECURE_STORE) {
      return null;
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    if (isWebDevBearerAuth()) {
      writeSessionToken(DEV_ACCESS_TOKEN_KEY, tokens.accessToken);
      writeSessionToken(DEV_REFRESH_TOKEN_KEY, tokens.refreshToken);
      return;
    }
    if (!USE_SECURE_STORE) {
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
    if (Platform.OS === "web") {
      removeSessionToken(DEV_ACCESS_TOKEN_KEY);
      removeSessionToken(DEV_REFRESH_TOKEN_KEY);
      removeSessionToken(ACCESS_TOKEN_KEY);
      removeSessionToken(REFRESH_TOKEN_KEY);
      try {
        globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
        globalThis.localStorage?.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // localStorage недоступен
      }
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // storage недоступен
  }
};
