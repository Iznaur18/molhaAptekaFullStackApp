import type { ProfileSectionId } from "./profileSections.js";

export const PROFILE_NAV_TONE_IDS = ["blue", "green", "amber", "red", "purple", "slate"] as const;

export type ProfileNavToneId = (typeof PROFILE_NAV_TONE_IDS)[number];

export type ProfileNavTonePalette = {
  main: string;
  soft: string;
  strong: string;
};

export type ProfileNavColorScheme = "light" | "dark" | "custom";

/** Mirrors `client/src/pages/my-profile/ui/MyProfilePage.css` nav tones (light). */
export const PROFILE_NAV_TONE_PALETTE: Record<ProfileNavToneId, ProfileNavTonePalette> = {
  blue: { main: "#2563eb", soft: "#eff6ff", strong: "#1557b3" },
  green: { main: "#059669", soft: "#f0fdf4", strong: "#047857" },
  amber: { main: "#d97706", soft: "#fefce8", strong: "#92400e" },
  red: { main: "#c62828", soft: "#fef2f2", strong: "#991b1b" },
  purple: { main: "#7c3aed", soft: "#ede9fe", strong: "#5b21b6" },
  slate: { main: "#475569", soft: "#f1f5f9", strong: "#334155" },
};

/**
 * Dark soft fills from app dark chrome / status surfaces — no near-white pastels.
 * Structural blues from dark palette: #8589AC / #596F9A / #405577 / #303147.
 */
export const PROFILE_NAV_TONE_PALETTE_DARK: Record<ProfileNavToneId, ProfileNavTonePalette> = {
  blue: { main: "#8589AC", soft: "#405577", strong: "#8589AC" },
  green: { main: "#4ade80", soft: "#064e3b", strong: "#86efac" },
  amber: { main: "#fbbf24", soft: "#422006", strong: "#fde68a" },
  red: { main: "#f87171", soft: "#450a0a", strong: "#fecaca" },
  purple: { main: "#8589AC", soft: "#405577", strong: "#8589AC" },
  slate: { main: "#596F9A", soft: "#303147", strong: "#8589AC" },
};

/** Пользовательская тема: #171717 #F25623 #4D4D4D #DEDEDE (+ status accents). */
export const PROFILE_NAV_TONE_PALETTE_CUSTOM: Record<ProfileNavToneId, ProfileNavTonePalette> = {
  blue: { main: "#F25623", soft: "#fde9e2", strong: "#d53e0d" },
  green: { main: "#16a34a", soft: "#eef5f0", strong: "#047857" },
  amber: { main: "#d97706", soft: "#f7f3ea", strong: "#92400e" },
  red: { main: "#c62828", soft: "#f7eeee", strong: "#991b1b" },
  purple: { main: "#F25623", soft: "#fde9e2", strong: "#d53e0d" },
  slate: { main: "#4D4D4D", soft: "#DEDEDE", strong: "#171717" },
};

const PROFILE_NAV_SECTION_TONE_MAP = {
  overview: "blue",
  "my-products": "blue",
  "my-sales": "green",
  "my-orders": "blue",
  auction: "amber",
  "installment-payments": "green",
  "installment-sales": "slate",
  subscriptions: "purple",
  wishlist: "red",
  "data-confirmation": "green",
  premium: "amber",
  "loyalty-points": "red",
  "partner-program": "green",
  "affiliate-listings": "green",
  advertising: "amber",
  "onec-integration": "blue",
  "edit-profile": "slate",
  "create-raffle": "purple",
  "product-moderation": "amber",
  "intro-ad-moderation": "amber",
  "seller-personal-category-moderation": "green",
  "product-reports": "red",
  "product-promotions": "blue",
  raffles: "purple",
  "data-confirmation-requests": "slate",
  courier: "green",
  "courier-moderation": "slate",
  "installment-disputes": "red",
  "admin-orders": "blue",
  "search-synonyms-admin": "blue",
  "category-tree-admin": "green",
  "app-intro-admin": "purple",
  "site-header-banner-admin": "slate",
  "product-manage-toggle-display-admin": "purple",
  "popular-products-admin": "amber",
  logout: "red",
} as const satisfies Partial<Record<ProfileSectionId | "logout", ProfileNavToneId>>;

export const resolveProfileNavSectionTone = (
  sectionId: ProfileSectionId | "logout",
): ProfileNavToneId => PROFILE_NAV_SECTION_TONE_MAP[sectionId] ?? "slate";

export const resolveProfileNavTonePalette = (
  tone: ProfileNavToneId,
  scheme: ProfileNavColorScheme = "light",
): ProfileNavTonePalette => {
  const table =
    scheme === "custom"
      ? PROFILE_NAV_TONE_PALETTE_CUSTOM
      : scheme === "dark"
        ? PROFILE_NAV_TONE_PALETTE_DARK
        : PROFILE_NAV_TONE_PALETTE;
  return table[tone] ?? table.slate;
};
