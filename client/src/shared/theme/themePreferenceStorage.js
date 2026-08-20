/** @typedef {"light" | "dark" | "custom"} ThemePreference */

const THEME_PREFERENCE_KEY = "app-theme-preference";

/**
 * @param {unknown} value
 * @returns {value is ThemePreference}
 */
function isThemePreference(value) {
  return value === "light" || value === "dark" || value === "custom";
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
    // Legacy: system → dark (старый инвертированный «dark» больше не
    // существует; "dark" теперь — валидная ручная палитра и тема по умолчанию).
    if (raw === "system") {
      saveThemePreference("dark");
      return "dark";
    }
  } catch {
    // storage недоступен
  }
  // Тёмная — тема по умолчанию для новых пользователей.
  return "dark";
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
