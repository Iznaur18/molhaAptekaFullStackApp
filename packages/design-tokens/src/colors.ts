import {
  formatHexColor,
  hslToRgb,
  mirrorLightness,
  parseHexColor,
  rgbToHsl,
  setLightness,
  shiftLightness,
  toRgbCss,
} from "./invertColorLightness";

/** Синхронизировано с client/src/shared/styles/designTokens.css (canonical v2) */
const izColorsCanonical = {
  text: "#111827",
  textMuted: "#6b7280",
  textSecondary: "#374151",
  textPlaceholder: "#9ca3af",
  ink: "#0f172a",
  /*
   * Neutrals v4 — явная лесенка слоёв (light):
   * bg (canvas) < surfaceMuted (recessed) < surfaceElevated (raised) < surface (white).
   * Разные значения дают чёткое зонирование — элементы не сливаются с фоном.
   * Холодный серый с лёгким синим подтоном под бренд (#284b7e / #1f6feb).
   */
  bg: "#e6eaf1",
  surfaceMuted: "#eef1f7",
  surfaceElevated: "#f5f7fb",
  surface: "#ffffff",
  onContrast: "#ffffff",
  primary: "#284b7e",
  action: "#1f6feb",
  actionHover: "#1557b3",
  actionSoft: "#eef2f8",
  actionBorder: "#d9e2ef",
  link: "#2563eb",
  success: "#16a34a",
  successSurface: "#eef5f0",
  successText: "#047857",
  warning: "#d97706",
  warningSurface: "#f7f3ea",
  warningText: "#92400e",
  danger: "#c62828",
  dangerSurface: "#f7eeee",
  dangerText: "#991b1b",
  info: "#0369a1",
  infoSoft: "#eef2f8",
  infoDeep: "#1e40af",
  border: "#d2d8e2",
  borderStrong: "#b7c0cd",
  accent: "#7c3aed",
  accentSoft: "#f2eff7",
  overlay: "rgb(15 23 42 / 45%)",
  overlayStrong: "rgb(15 23 42 / 72%)",
  overlaySubtle: "rgb(17 24 39 / 8%)",
  focusRing: "rgb(31 111 235 / 15%)",
} as const;

/** Hard blues — identical in dark (brand/interactive). */
export const DARK_THEME_HARD_BLUE_KEYS = [
  "primary",
  "action",
  "actionHover",
  "link",
  "info",
  "infoDeep",
] as const;

const SOFT_BLUE_FILL_LIGHTNESS = 0.18;
const SOFT_BLUE_BORDER_LIGHTNESS = 0.32;
const STATUS_SOLID_BRIGHTEN = 0.14;
const STATUS_TEXT_BRIGHTEN = 0.22;
const FOCUS_RING_ALPHA = 0.22;
const OVERLAY_ALPHA = 0.55;
const OVERLAY_STRONG_ALPHA = 0.72;
const OVERLAY_SUBTLE_ALPHA = 0.08;
/** Keep cards above page bg after HSL mirror (white→black otherwise sinks under bg). */
const SURFACE_ABOVE_BG = 0.06;
const SURFACE_MUTED_ABOVE_BG = 0.03;
const SURFACE_ELEVATED_ABOVE_BG = 0.08;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const elevateAboveBg = (hex: string, bgHex: string, delta: number): string => {
  const colorHsl = rgbToHsl(parseHexColor(hex));
  const bgHsl = rgbToHsl(parseHexColor(bgHex));
  const minLightness = clamp01(bgHsl.l + delta);
  if (colorHsl.l >= minLightness) {
    return hex;
  }
  return formatHexColor(hslToRgb({ ...colorHsl, l: minLightness }));
};

const buildDarkCanonicalFromLight = (
  light: typeof izColorsCanonical,
): Record<keyof typeof izColorsCanonical, string> => {
  const bg = mirrorLightness(light.bg);
  const text = mirrorLightness(light.text);

  return {
    text,
    textMuted: mirrorLightness(light.textMuted),
    textSecondary: mirrorLightness(light.textSecondary),
    textPlaceholder: mirrorLightness(light.textPlaceholder),
    ink: mirrorLightness(light.ink),
    bg,
    surface: elevateAboveBg(mirrorLightness(light.surface), bg, SURFACE_ABOVE_BG),
    surfaceMuted: elevateAboveBg(
      mirrorLightness(light.surfaceMuted),
      bg,
      SURFACE_MUTED_ABOVE_BG,
    ),
    surfaceElevated: elevateAboveBg(
      mirrorLightness(light.surfaceElevated),
      bg,
      SURFACE_ELEVATED_ABOVE_BG,
    ),
    onContrast: light.onContrast,

    primary: light.primary,
    action: light.action,
    actionHover: light.actionHover,
    actionSoft: setLightness(light.actionSoft, SOFT_BLUE_FILL_LIGHTNESS),
    actionBorder: setLightness(light.actionBorder, SOFT_BLUE_BORDER_LIGHTNESS),
    link: light.link,

    success: shiftLightness(light.success, STATUS_SOLID_BRIGHTEN),
    successSurface: mirrorLightness(light.successSurface),
    successText: shiftLightness(light.successText, STATUS_TEXT_BRIGHTEN),
    warning: shiftLightness(light.warning, STATUS_SOLID_BRIGHTEN),
    warningSurface: mirrorLightness(light.warningSurface),
    warningText: shiftLightness(light.warningText, STATUS_TEXT_BRIGHTEN),
    danger: shiftLightness(light.danger, STATUS_SOLID_BRIGHTEN),
    dangerSurface: mirrorLightness(light.dangerSurface),
    dangerText: shiftLightness(light.dangerText, STATUS_TEXT_BRIGHTEN),

    info: light.info,
    infoSoft: setLightness(light.infoSoft, SOFT_BLUE_FILL_LIGHTNESS),
    infoDeep: light.infoDeep,

    border: mirrorLightness(light.border),
    borderStrong: mirrorLightness(light.borderStrong),
    accent: light.accent,
    accentSoft: mirrorLightness(light.accentSoft),

    overlay: toRgbCss(bg, OVERLAY_ALPHA),
    overlayStrong: toRgbCss(bg, OVERLAY_STRONG_ALPHA),
    overlaySubtle: toRgbCss(text, OVERLAY_SUBTLE_ALPHA),
    focusRing: toRgbCss(light.action, FOCUS_RING_ALPHA),
  };
};

const izColorsDarkCanonical = buildDarkCanonicalFromLight(izColorsCanonical);

/** @deprecated mobile compat — merged into canonical tokens */
const izColorsCompat = {
  nearBlack: izColorsCanonical.ink,
  primaryBright: izColorsCanonical.action,
  actionSurface: izColorsCanonical.actionSoft,
  infoNavy: izColorsCanonical.infoDeep,
  premium: "#c9a227",
  star: izColorsCanonical.warning,
  starMuted: izColorsCanonical.borderStrong,
  raffleSurface: izColorsCanonical.warningSurface,
  raffleBorder: izColorsCanonical.warning,
  warningBorder: izColorsCanonical.warning,
} as const;

const izColorsDarkCompat = {
  nearBlack: izColorsDarkCanonical.ink,
  primaryBright: izColorsDarkCanonical.action,
  actionSurface: izColorsDarkCanonical.actionSoft,
  infoNavy: izColorsDarkCanonical.infoDeep,
  premium: "#e0c35a",
  star: izColorsDarkCanonical.warning,
  starMuted: izColorsDarkCanonical.borderStrong,
  raffleSurface: izColorsDarkCanonical.warningSurface,
  raffleBorder: izColorsDarkCanonical.warning,
  warningBorder: izColorsDarkCanonical.warning,
} as const;

export const izColors = {
  ...izColorsCanonical,
  ...izColorsCompat,
} as const;

export const izColorsDark = {
  ...izColorsDarkCanonical,
  ...izColorsDarkCompat,
} as const;

/**
 * Пользовательская палитра (бренд-фото):
 * #171717 / #F25623 / #4D4D4D / #DEDEDE.
 * Светлая логика: canvas #DEDEDE, карточки белее; interactive → orange.
 * Status (success/warning/danger/info) — как в light.
 */
const CUSTOM_BLACK = "#171717";
const CUSTOM_ORANGE = "#F25623";
const CUSTOM_DARK_GRAY = "#4D4D4D";
const CUSTOM_LIGHT_GRAY = "#DEDEDE";

const izColorsCustomCanonical = {
  text: CUSTOM_BLACK,
  textMuted: CUSTOM_DARK_GRAY,
  textSecondary: CUSTOM_DARK_GRAY,
  textPlaceholder: "#8a8a8a",
  ink: CUSTOM_BLACK,
  bg: CUSTOM_LIGHT_GRAY,
  surfaceMuted: "#e8e8e8",
  surfaceElevated: "#f4f4f4",
  surface: "#ffffff",
  onContrast: "#ffffff",
  primary: CUSTOM_ORANGE,
  action: CUSTOM_ORANGE,
  actionHover: shiftLightness(CUSTOM_ORANGE, -0.1),
  actionSoft: setLightness(CUSTOM_ORANGE, 0.94),
  actionBorder: setLightness(CUSTOM_ORANGE, 0.82),
  link: CUSTOM_ORANGE,
  success: izColorsCanonical.success,
  successSurface: izColorsCanonical.successSurface,
  successText: izColorsCanonical.successText,
  warning: izColorsCanonical.warning,
  warningSurface: izColorsCanonical.warningSurface,
  warningText: izColorsCanonical.warningText,
  danger: izColorsCanonical.danger,
  dangerSurface: izColorsCanonical.dangerSurface,
  dangerText: izColorsCanonical.dangerText,
  info: izColorsCanonical.info,
  infoSoft: izColorsCanonical.infoSoft,
  infoDeep: izColorsCanonical.infoDeep,
  border: "#c4c4c4",
  borderStrong: "#a0a0a0",
  accent: CUSTOM_ORANGE,
  accentSoft: setLightness(CUSTOM_ORANGE, 0.94),
  overlay: toRgbCss(CUSTOM_BLACK, 0.45),
  overlayStrong: toRgbCss(CUSTOM_BLACK, 0.72),
  overlaySubtle: toRgbCss(CUSTOM_BLACK, 0.08),
  focusRing: toRgbCss(CUSTOM_ORANGE, 0.22),
} as const;

const izColorsCustomCompat = {
  nearBlack: izColorsCustomCanonical.ink,
  primaryBright: izColorsCustomCanonical.action,
  actionSurface: izColorsCustomCanonical.actionSoft,
  infoNavy: izColorsCustomCanonical.infoDeep,
  premium: "#c9a227",
  star: izColorsCustomCanonical.warning,
  starMuted: izColorsCustomCanonical.borderStrong,
  raffleSurface: izColorsCustomCanonical.warningSurface,
  raffleBorder: izColorsCustomCanonical.warning,
  warningBorder: izColorsCustomCanonical.warning,
} as const;

export const izColorsCustom = {
  ...izColorsCustomCanonical,
  ...izColorsCustomCompat,
} as const;
