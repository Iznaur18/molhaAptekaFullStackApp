import { setLightness, shiftLightness, toRgbCss } from "./invertColorLightness";

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

/*
 * Тёмная палитра («Тёмный» режим) — ручная, БЕЗ инверсии светлой темы.
 * Навеяна фото чёрного Porsche 911: угольный холст с лёгким холодным
 * подтоном, ступенчатые тёмно-серые слои (bg < surfaceMuted <
 * surfaceElevated < surface), светлый текст. Монохром: интерактив —
 * серебристо-платиновый (без синего). `action` светлый, поэтому читается
 * и как текст (цена/ссылки на тёмной карточке), и как фон кнопки — при
 * этом onContrast тёмный, чтобы текст на серебряной кнопке был читаем.
 * Премиальный золотой акцент (крест на капоте) вынесен в compat.premium.
 * Статусы осветлены для читаемости на тёмном.
 */
const DARK_CANVAS = "#0c0e12";
const DARK_TEXT = "#f2f4f8";
const DARK_SILVER = "#d7dbe2";

const izColorsDarkCanonical = {
  text: DARK_TEXT,
  textMuted: "#9aa1ad",
  textSecondary: "#c7cdd8",
  textPlaceholder: "#6b7280",
  ink: "#f7f9fc",
  bg: DARK_CANVAS,
  surfaceMuted: "#14171d",
  surfaceElevated: "#1b1f27",
  surface: "#222732",
  onContrast: "#12151b",
  primary: "#dfe3ea",
  action: DARK_SILVER,
  actionHover: "#c4cad4",
  actionSoft: "#1b1f27",
  actionBorder: "#39404d",
  link: DARK_SILVER,
  success: "#2fbf6d",
  successSurface: "#122019",
  successText: "#5cd68f",
  warning: "#e0a12a",
  warningSurface: "#241d10",
  warningText: "#f2c766",
  danger: "#e5484d",
  dangerSurface: "#241315",
  dangerText: "#f38b8e",
  info: "#aab3c0",
  infoSoft: "#1b1f27",
  infoDeep: "#cfd5de",
  border: "#272c36",
  borderStrong: "#39404d",
  accent: "#a78bfa",
  accentSoft: "#1d1b2b",
  overlay: toRgbCss(DARK_CANVAS, 0.55),
  overlayStrong: toRgbCss(DARK_CANVAS, 0.78),
  overlaySubtle: toRgbCss(DARK_TEXT, 0.08),
  focusRing: toRgbCss(DARK_SILVER, 0.4),
} as const;

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
