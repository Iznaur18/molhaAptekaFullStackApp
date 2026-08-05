import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark" | "custom";

const THEME_PREFERENCE_KEY = "app-theme-preference";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system" || value === "custom";

export const loadThemePreference = async (): Promise<ThemePreference> => {
  try {
    const raw = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
    if (isThemePreference(raw)) {
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
