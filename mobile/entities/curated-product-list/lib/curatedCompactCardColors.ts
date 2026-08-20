import { izColorsDark, type IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Синхронизировано с client CuratedProductCompactCard.css + designTokens.css */
export const resolveCuratedCompactCardColors = (c: ThemeColors) => {
  const isDark = c.bg === izColorsDark.bg;
  return {
    border: c.border,
    imageBg: c.surfaceElevated,
    imageFallbackText: c.textSecondary,
    /* light/custom: action bg + onContrast text; dark: наоборот */
    priceBg: isDark ? c.onContrast : c.action,
    priceText: isDark ? c.action : c.onContrast,
  } as const;
};
