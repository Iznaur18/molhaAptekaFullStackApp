import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

const THEME_PREFERENCE_KEY = "app-theme-preference";

export const loadThemePreference = async (): Promise<ThemePreference> => {
  try {
    const raw = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "system";
};

export const saveThemePreference = async (preference: ThemePreference): Promise<void> => {
  try {
    await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
  } catch {
    // ignore
  }
};
