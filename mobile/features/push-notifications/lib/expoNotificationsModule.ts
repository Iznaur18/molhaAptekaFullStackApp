import Constants from "expo-constants";
import { Platform } from "react-native";

import type * as ExpoNotifications from "expo-notifications";

/**
 * Remote push убран из Expo Go на Android с SDK 53.
 * Любой top-level `import "expo-notifications"` грузит
 * `DevicePushTokenAutoRegistration.fx` → `console.error` в Metro.
 */
export const canUseExpoNotificationsModule = (): boolean => {
  if (Platform.OS === "web") {
    return false;
  }
  if (Platform.OS === "android" && Constants.appOwnership === "expo") {
    return false;
  }
  return true;
};

let cachedModule: typeof ExpoNotifications | null | undefined;

/** Lazy require — не трогаем пакет в Expo Go Android. */
export const getExpoNotificationsModule = (): typeof ExpoNotifications | null => {
  if (!canUseExpoNotificationsModule()) {
    return null;
  }
  if (cachedModule === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("expo-notifications") as typeof ExpoNotifications;
  }
  return cachedModule;
};
