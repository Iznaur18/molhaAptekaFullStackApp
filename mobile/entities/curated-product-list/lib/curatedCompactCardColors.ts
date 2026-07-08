import { semanticColors } from "@/shared/theme/semanticColors";

/** Синхронизировано с client CuratedProductCompactCard.css + designTokens.css */
export const CURATED_COMPACT_CARD_COLORS = {
  border: semanticColors.border,
  imageBg: semanticColors.surfaceElevated,
  imageFallbackText: semanticColors.textSecondary,
  priceBg: semanticColors.action,
  priceText: semanticColors.onContrast,
} as const;
