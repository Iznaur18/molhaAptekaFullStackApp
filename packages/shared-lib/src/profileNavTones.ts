import type { ProfileSectionId } from "./profileSections.js";

export const PROFILE_NAV_TONE_IDS = ["blue", "green", "amber", "red", "purple", "slate"] as const;

export type ProfileNavToneId = (typeof PROFILE_NAV_TONE_IDS)[number];

export type ProfileNavTonePalette = {
  main: string;
  soft: string;
  strong: string;
};

/** Mirrors `client/src/pages/my-profile/ui/MyProfilePage.css` nav tones (light). */
export const PROFILE_NAV_TONE_PALETTE: Record<ProfileNavToneId, ProfileNavTonePalette> = {
  blue: { main: "#2563eb", soft: "#eff6ff", strong: "#1557b3" },
  green: { main: "#059669", soft: "#f0fdf4", strong: "#047857" },
  amber: { main: "#d97706", soft: "#fefce8", strong: "#92400e" },
  red: { main: "#c62828", soft: "#fef2f2", strong: "#991b1b" },
  purple: { main: "#7c3aed", soft: "#ede9fe", strong: "#5b21b6" },
  slate: { main: "#475569", soft: "#f1f5f9", strong: "#334155" },
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
  advertising: "amber",
  "edit-profile": "slate",
  "create-raffle": "purple",
  "product-moderation": "amber",
  "intro-ad-moderation": "amber",
  "seller-personal-category-moderation": "green",
  "product-reports": "red",
  "product-promotions": "blue",
  raffles: "purple",
  "data-confirmation-requests": "slate",
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
): ProfileNavTonePalette => PROFILE_NAV_TONE_PALETTE[tone] ?? PROFILE_NAV_TONE_PALETTE.slate;
