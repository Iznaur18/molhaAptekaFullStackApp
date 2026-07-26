import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "izibuy_access_token";
const REFRESH_TOKEN_KEY = "izibuy_refresh_token";
const USE_WEB_STORAGE = Platform.OS === "web";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Web: sessionStorage (не localStorage) — токены не переживают закрытие вкладки
 * и меньше живут при XSS. Миграция: один раз переносим из legacy localStorage.
 */
const webStorage = (): Storage | null => {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
};

const migrateLegacyLocalStorageTokens = (): void => {
  try {
    const legacy = globalThis.localStorage;
    const session = webStorage();
    if (!legacy || !session) {
      return;
    }
    for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]) {
      const value = legacy.getItem(key);
      if (value && !session.getItem(key)) {
        session.setItem(key, value);
      }
      legacy.removeItem(key);
    }
  } catch {
    // storage недоступен
  }
};

const webGet = (key: string): string | null => {
  migrateLegacyLocalStorageTokens();
  try {
    return webStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const webSet = (key: string, value: string): void => {
  migrateLegacyLocalStorageTokens();
  webStorage()?.setItem(key, value);
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // ignore
  }
};

const webDelete = (key: string): void => {
  try {
    webStorage()?.removeItem(key);
    globalThis.localStorage?.removeItem(key);
  } catch {
    // storage недоступен
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (USE_WEB_STORAGE) {
      return webGet(ACCESS_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (USE_WEB_STORAGE) {
      return webGet(REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    if (USE_WEB_STORAGE) {
      webSet(ACCESS_TOKEN_KEY, tokens.accessToken);
      webSet(REFRESH_TOKEN_KEY, tokens.refreshToken);
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
    if (USE_WEB_STORAGE) {
      webDelete(ACCESS_TOKEN_KEY);
      webDelete(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // storage недоступен
  }
};
