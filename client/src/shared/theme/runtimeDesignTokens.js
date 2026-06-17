import { resolveIzTheme } from "@izibuy/design-tokens";

const COLOR_VAR_MAP = {
  text: "--iz-color-text",
  textMuted: "--iz-color-text-muted",
  textSecondary: "--iz-color-text-secondary",
  ink: "--iz-color-ink",
  bg: "--iz-color-bg",
  surface: "--iz-color-surface",
  surfaceMuted: "--iz-color-surface-muted",
  surfaceElevated: "--iz-color-surface-elevated",
  primary: "--iz-color-primary",
  primaryBright: "--iz-color-primary-bright",
  action: "--iz-color-action",
  actionHover: "--iz-color-action-hover",
  actionSurface: "--iz-color-action-surface",
  link: "--iz-color-link",
  danger: "--iz-color-danger",
  success: "--iz-color-success",
  warning: "--iz-color-warning",
  warningSurface: "--iz-color-warning-surface",
  warningBorder: "--iz-color-warning-border",
  warningText: "--iz-color-warning-text",
  premium: "--iz-color-premium",
  star: "--iz-color-star",
  starMuted: "--iz-color-star-muted",
  raffleSurface: "--iz-color-raffle-surface",
  raffleBorder: "--iz-color-raffle-border",
  border: "--iz-color-border",
  borderStrong: "--iz-color-border-strong",
  nearBlack: "--iz-color-near-black",
  onContrast: "--iz-color-on-contrast",
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
