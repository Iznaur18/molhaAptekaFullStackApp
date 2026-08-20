import { Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";

export type ThemePreference = "light" | "dark" | "custom";

const THEME_PREFERENCE_KEY = "app-theme-preference";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "custom";

/** OS dark → dark, иначе пользовательская (custom). */
export const resolveThemePreferenceFromSystem = (): ThemePreference =>
  Appearance.getColorScheme() === "dark" ? "dark" : "custom";

export const loadThemePreference = async (): Promise<ThemePreference> => {
  try {
    const raw = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
    if (isThemePreference(raw)) {
      return raw;
    }
    // Legacy "system" — следовать OS, не форсить custom.
    if (raw === "system") {
      return resolveThemePreferenceFromSystem();
    }
  } catch {
    // ignore
  }
  return resolveThemePreferenceFromSystem();
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
