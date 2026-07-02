import type { TextStyle, ViewStyle } from "react-native";

import {
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "@/entities/product/lib/calculateProductPromotionPointsCost";

const SUCCESS_SOFT = "#ecfdf5";
const SUCCESS_BORDER = "#05966947";
const DANGER_SURFACE = "#fef2f2";
const DANGER_BORDER = "#dc262647";
const DANGER_ACCENT = "#dc2626";
const DANGER_STRONG = "#b42318";
const GOLD_SOFT = "#fef3c7";
const PURPLE_SOFT = "#ede9fe";
const ACTION_SOFT = "#eff6ff";
const LINK = "#2563eb";
const LINK_HOVER = "#1d4ed8";

type TierChrome = {
  accent: string;
  soft: string;
  badgeText: string;
};

const TIER_CHROME: Record<number, TierChrome> = {
  [PRODUCT_PROMOTION_TIER_GOLD]: {
    accent: "#d97706",
    soft: GOLD_SOFT,
    badgeText: "#92400e",
  },
  [PRODUCT_PROMOTION_TIER_TOP]: {
    accent: "#7c3aed",
    soft: PURPLE_SOFT,
    badgeText: "#5b21b6",
  },
  [PRODUCT_PROMOTION_TIER_BANNER]: {
    accent: DANGER_ACCENT,
    soft: DANGER_SURFACE,
    badgeText: "#991b1b",
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
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
      },
      badge: {
        backgroundColor: chrome.soft,
      },
      badgeText: {
        color: chrome.badgeText,
      },
      title: {
        color: "#111827",
      },
    };
  }

  return {
    card: {
      borderColor: `${chrome.accent}8c`,
      backgroundColor: chrome.soft,
    },
    badge: {
      backgroundColor: chrome.soft,
    },
    badgeText: {
      color: chrome.badgeText,
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
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
      },
      price: {
        color: LINK,
      },
    };
  }

  if (selectedTier === PRODUCT_PROMOTION_TIER_BANNER) {
    return {
      chip: {
        borderColor: DANGER_ACCENT,
        backgroundColor: DANGER_SURFACE,
      },
      price: {
        color: DANGER_ACCENT,
      },
    };
  }

  return {
    chip: {
      borderColor: LINK,
      backgroundColor: ACTION_SOFT,
    },
    price: {
      color: LINK,
    },
  };
};

export const productPromotionModalPalette = {
  productBoxBg: "#f8fafc",
  productBoxBorder: "#e5e7eb",
  balanceOkBg: SUCCESS_SOFT,
  balanceOkBorder: SUCCESS_BORDER,
  balanceLowBg: DANGER_SURFACE,
  balanceLowBorder: DANGER_BORDER,
  summaryBg: "#f8fafc",
  summaryBorder: "#e5e7eb",
  summaryTotal: LINK_HOVER,
  errorBg: DANGER_SURFACE,
  errorBorder: `${DANGER_ACCENT}40`,
  errorText: DANGER_STRONG,
} as const;
