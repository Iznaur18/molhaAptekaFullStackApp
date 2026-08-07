import * as SecureStore from "expo-secure-store";

export type ThemePreference = "light" | "custom";

const THEME_PREFERENCE_KEY = "app-theme-preference";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "custom";

export const loadThemePreference = async (): Promise<ThemePreference> => {
  try {
    const raw = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
    if (isThemePreference(raw)) {
      return raw;
    }
    // Legacy: system / dark → custom
    if (raw === "system" || raw === "dark") {
      await saveThemePreference("custom");
      return "custom";
    }
  } catch {
    // ignore
  }
  return "custom";
};

export const saveThemePreference = async (preference: ThemePreference): Promise<void> => {
  if (!isThemePreference(preference)) {
    return;
  }
  try {
    await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
  } catch {
    // ignore
  }
};
