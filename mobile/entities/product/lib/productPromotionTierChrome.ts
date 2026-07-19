import { semanticColors } from "@/shared/theme/semanticColors";
import type { TextStyle, ViewStyle } from "react-native";

import {
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "@/entities/product/lib/calculateProductPromotionPointsCost";

type TierChrome = {
  accent: string;
  soft: string;
  badgeText: string;
};

const TIER_CHROME: Record<number, TierChrome> = {
  [PRODUCT_PROMOTION_TIER_GOLD]: {
    accent: semanticColors.warning,
    soft: semanticColors.warningSurface,
    badgeText: semanticColors.warningText,
  },
  [PRODUCT_PROMOTION_TIER_TOP]: {
    accent: semanticColors.accent,
    soft: semanticColors.accentSoft,
    badgeText: semanticColors.accent,
  },
  [PRODUCT_PROMOTION_TIER_BANNER]: {
    accent: semanticColors.danger,
    soft: semanticColors.dangerSurface,
    badgeText: semanticColors.dangerText,
  },
};

export const getProductPromotionTierChrome = (tier: number): TierChrome =>
  TIER_CHROME[tier] ?? TIER_CHROME[PRODUCT_PROMOTION_TIER_GOLD];

export const resolveProductPromotionTierCardStyle = (
  tier: number,
  isSelected: boolean,
): { card: ViewStyle; badge: ViewStyle; badgeText: TextStyle; title: TextStyle } => {
  const chrome = getProductPromotionTierChrome(tier);

  if (!isSelected) {
    return {
      card: {
        borderColor: semanticColors.border,
        backgroundColor: semanticColors.surface,
      },
      badge: {
        backgroundColor: chrome.soft,
      },
      badgeText: {
        color: chrome.badgeText,
      },
      title: {
        color: semanticColors.text,
      },
    };
  }

  return {
    card: {
      borderColor: chrome.accent,
      backgroundColor: chrome.soft,
      borderWidth: 2,
    },
    badge: {
      backgroundColor: chrome.accent,
    },
    badgeText: {
      color: semanticColors.onContrast,
    },
    title: {
      color: chrome.accent,
    },
  };
};

export const resolveProductPromotionDurationChipStyle = (
  isSelected: boolean,
  selectedTier: number,
): { chip: ViewStyle; price: TextStyle } => {
  if (!isSelected) {
    return {
      chip: {
        borderColor: semanticColors.border,
        backgroundColor: semanticColors.surface,
      },
      price: {
        color: semanticColors.link,
      },
    };
  }

  if (selectedTier === PRODUCT_PROMOTION_TIER_BANNER) {
    return {
      chip: {
        borderColor: semanticColors.danger,
        backgroundColor: semanticColors.dangerSurface,
        borderWidth: 2,
      },
      price: {
        color: semanticColors.danger,
      },
    };
  }

  return {
    chip: {
      borderColor: semanticColors.action,
      backgroundColor: semanticColors.actionSoft,
      borderWidth: 2,
    },
    price: {
      color: semanticColors.link,
    },
  };
};

export const productPromotionModalPalette = {
  productBoxBg: semanticColors.surfaceElevated,
  productBoxBorder: semanticColors.border,
  balanceOkBg: semanticColors.successSurface,
  balanceOkBorder: `${semanticColors.success}47`,
  balanceLowBg: semanticColors.dangerSurface,
  balanceLowBorder: `${semanticColors.danger}47`,
  summaryBg: semanticColors.surfaceElevated,
  summaryBorder: semanticColors.border,
  summaryTotal: semanticColors.actionHover,
  errorBg: semanticColors.dangerSurface,
  errorBorder: `${semanticColors.danger}40`,
  errorText: semanticColors.danger,
} as const;
