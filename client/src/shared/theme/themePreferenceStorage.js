/** @typedef {"light" | "custom"} ThemePreference */

const THEME_PREFERENCE_KEY = "app-theme-preference";

/**
 * @param {unknown} value
 * @returns {value is ThemePreference}
 */
function isThemePreference(value) {
  return value === "light" || value === "custom";
}

/**
 * @returns {ThemePreference}
 */
export function loadThemePreference() {
  try {
    const raw = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (isThemePreference(raw)) {
      return raw;
    }
    // Legacy: system / dark → custom
    if (raw === "system" || raw === "dark") {
      saveThemePreference("custom");
      return "custom";
    }
  } catch {
    // storage недоступен
  }
  return "custom";
}

/**
 * @param {ThemePreference} preference
 */
export function saveThemePreference(preference) {
  if (!isThemePreference(preference)) {
    return;
  }
  try {
    localStorage.setItem(THEME_PREFERENCE_KEY, preference);
  } catch {
    // storage недоступен
  }
}
