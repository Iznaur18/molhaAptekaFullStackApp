import { reportClientIssue } from "../lib/reportClientIssue.js";
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
 * OS dark → dark, иначе пользовательская (custom).
 * @returns {ThemePreference}
 */
export function resolveThemePreferenceFromSystem() {
  try {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch (error) {
    // matchMedia недоступен
    reportClientIssue("themePreferenceStorage#1", error);
  }
  return "custom";
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
    // Legacy "system" — следовать OS, не записывать жёсткий dark.
    if (raw === "system") {
      return resolveThemePreferenceFromSystem();
    }
  } catch (error) {
    // storage недоступен
    reportClientIssue("themePreferenceStorage#2", error);
  }
  return resolveThemePreferenceFromSystem();
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
  } catch (error) {
    // storage недоступен
    reportClientIssue("themePreferenceStorage#3", error);
  }
}
