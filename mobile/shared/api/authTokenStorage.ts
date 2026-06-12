import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "izibuy_access_token";
const REFRESH_TOKEN_KEY = "izibuy_refresh_token";
const USE_WEB_STORAGE = Platform.OS === "web";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const webGet = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const webSet = (key: string, value: string): void => {
  globalThis.localStorage?.setItem(key, value);
};

const webDelete = (key: string): void => {
  try {
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
