import { resolveIzTheme } from "@izibuy/design-tokens";

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

const applyThemeToRoot = (scheme) => {
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
};

export const initRuntimeDesignTokens = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => applyThemeToRoot(media.matches ? "dark" : "light");

  apply();
  media.addEventListener("change", apply);
};
