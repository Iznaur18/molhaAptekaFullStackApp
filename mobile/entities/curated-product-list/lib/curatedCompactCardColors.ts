import type { IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Синхронизировано с client CuratedProductCompactCard.css + designTokens.css */
export const resolveCuratedCompactCardColors = (c: ThemeColors) =>
  ({
    border: c.border,
    imageBg: c.surfaceElevated,
    imageFallbackText: c.textSecondary,
    priceBg: c.action,
    priceText: c.onContrast,
  }) as const;
