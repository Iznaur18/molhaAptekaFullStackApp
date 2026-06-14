import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { APP_INTRO_SEEN_STORAGE_KEY } from "@/features/app-intro/model/introConstants";

const USE_WEB_STORAGE = Platform.OS === "web";

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

export const hasSeenAppIntro = async (): Promise<boolean> => {
  try {
    if (USE_WEB_STORAGE) {
      return webGet(APP_INTRO_SEEN_STORAGE_KEY) === "1";
    }
    const value = await SecureStore.getItemAsync(APP_INTRO_SEEN_STORAGE_KEY);
    return value === "1";
  } catch {
    return false;
  }
};

export const markAppIntroSeen = async (): Promise<void> => {
  try {
    if (USE_WEB_STORAGE) {
      webSet(APP_INTRO_SEEN_STORAGE_KEY, "1");
      return;
    }
    await SecureStore.setItemAsync(APP_INTRO_SEEN_STORAGE_KEY, "1");
  } catch {
    // storage недоступен
  }
};
