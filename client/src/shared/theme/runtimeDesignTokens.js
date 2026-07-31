import { resolveIzTheme } from "@izibuy/design-tokens";

import {
  loadThemePreference,
  saveThemePreference,
} from "./themePreferenceStorage.js";

/** @typedef {import('./themePreferenceStorage.js').ThemePreference} ThemePreference */

const COLOR_VAR_MAP = {
  text: "--iz-color-text",
  textMuted: "--iz-color-text-muted",
  textSecondary: "--iz-color-text-secondary",
  textPlaceholder: "--iz-color-text-placeholder",
  ink: "--iz-color-ink",
  bg: "--iz-color-bg",
  surface: "--iz-color-surface",
  surfaceMuted: "--iz-color-surface-muted",
  surfaceElevated: "--iz-color-surface-elevated",
  onContrast: "--iz-color-on-contrast",
  primary: "--iz-color-primary",
  action: "--iz-color-action",
  actionHover: "--iz-color-action-hover",
  actionSoft: "--iz-color-action-soft",
  actionBorder: "--iz-color-action-border",
  link: "--iz-color-link",
  success: "--iz-color-success",
  successSurface: "--iz-color-success-surface",
  successText: "--iz-color-success-text",
  warning: "--iz-color-warning",
  warningSurface: "--iz-color-warning-surface",
  warningText: "--iz-color-warning-text",
  danger: "--iz-color-danger",
  dangerSurface: "--iz-color-danger-surface",
  dangerText: "--iz-color-danger-text",
  info: "--iz-color-info",
  infoSoft: "--iz-color-info-soft",
  infoDeep: "--iz-color-info-deep",
  border: "--iz-color-border",
  borderStrong: "--iz-color-border-strong",
  accent: "--iz-color-accent",
  accentSoft: "--iz-color-accent-soft",
  overlay: "--iz-color-overlay",
  overlayStrong: "--iz-color-overlay-strong",
  overlaySubtle: "--iz-color-overlay-subtle",
  focusRing: "--iz-color-focus-ring",
};

/** @type {ThemePreference} */
let themePreference = "system";

/** @type {Set<(preference: ThemePreference) => void>} */
const preferenceListeners = new Set();

/**
 * @returns {boolean}
 */
function isSystemDark() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/**
 * @param {ThemePreference} preference
 * @returns {"light" | "dark"}
 */
function resolveScheme(preference) {
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return isSystemDark() ? "dark" : "light";
}

/**
 * @param {"light" | "dark"} scheme
 */
function applyThemeToRoot(scheme) {
  if (typeof document === "undefined") {
    return;
  }

  const theme = resolveIzTheme(scheme);
  const rootStyle = document.documentElement.style;

  for (const [tokenKey, cssVar] of Object.entries(COLOR_VAR_MAP)) {
    const tokenValue = theme.colors[tokenKey];
    if (typeof tokenValue === "string" && tokenValue.trim()) {
      rootStyle.setProperty(cssVar, tokenValue);
    }
  }

  document.documentElement.dataset.theme = scheme;
  rootStyle.colorScheme = scheme;

  const bg = theme.colors.bg;
  if (typeof bg === "string" && bg.trim()) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", bg.trim());
  }
}

function applyCurrentTheme() {
  applyThemeToRoot(resolveScheme(themePreference));
}

/**
 * @returns {ThemePreference}
 */
export function getThemePreference() {
  return themePreference;
}

/**
 * @param {ThemePreference} preference
 */
export function setThemePreference(preference) {
  themePreference = preference;
  saveThemePreference(preference);
  applyCurrentTheme();
  preferenceListeners.forEach((listener) => listener(preference));
}

/**
 * @param {(preference: ThemePreference) => void} listener
 * @returns {() => void}
 */
export function subscribeThemePreference(listener) {
  preferenceListeners.add(listener);
  return () => {
    preferenceListeners.delete(listener);
  };
}

export const initRuntimeDesignTokens = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }

  themePreference = loadThemePreference();
  applyCurrentTheme();

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (themePreference === "system") {
      applyCurrentTheme();
    }
  });
};
