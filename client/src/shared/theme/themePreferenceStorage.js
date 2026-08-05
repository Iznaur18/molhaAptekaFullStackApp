/** @typedef {"system" | "light" | "dark" | "custom"} ThemePreference */

const THEME_PREFERENCE_KEY = "app-theme-preference";

/**
 * @param {unknown} value
 * @returns {value is ThemePreference}
 */
function isThemePreference(value) {
  return (
    value === "system" ||
    value === "light" ||
    value === "dark" ||
    value === "custom"
  );
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
  } catch {
    // storage недоступен
  }
  return "system";
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
