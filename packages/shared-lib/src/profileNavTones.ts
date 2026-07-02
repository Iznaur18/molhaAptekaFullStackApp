import type { ProfileSectionId } from "./profileSections.js";

export const PROFILE_NAV_TONE_IDS = [
  "indigo",
  "sky",
  "blue",
  "emerald",
  "green",
  "teal",
  "cyan",
  "amber",
  "gold",
  "orange",
  "rose",
  "red",
  "pink",
  "fuchsia",
  "purple",
  "violet",
  "lime",
  "slate",
] as const;

export type ProfileNavToneId = (typeof PROFILE_NAV_TONE_IDS)[number];

export type ProfileNavTonePalette = {
  main: string;
  soft: string;
  strong: string;
};

/** Mirrors `client/src/pages/my-profile/ui/MyProfilePage.css` nav tones (light). */
export const PROFILE_NAV_TONE_PALETTE: Record<ProfileNavToneId, ProfileNavTonePalette> = {
  indigo: { main: "#4f46e5", soft: "#eef2ff", strong: "#4338ca" },
  sky: { main: "#0284c7", soft: "#e0f2fe", strong: "#0369a1" },
  blue: { main: "#2563eb", soft: "#dbeafe", strong: "#1d4ed8" },
  emerald: { main: "#059669", soft: "#d1fae5", strong: "#047857" },
  green: { main: "#16a34a", soft: "#dcfce7", strong: "#15803d" },
  teal: { main: "#0d9488", soft: "#ccfbf1", strong: "#0f766e" },
  cyan: { main: "#0891b2", soft: "#cffafe", strong: "#0e7490" },
  amber: { main: "#d97706", soft: "#fef3c7", strong: "#b45309" },
  gold: { main: "#ca8a04", soft: "#fef9c3", strong: "#a16207" },
  orange: { main: "#ea580c", soft: "#ffedd5", strong: "#c2410c" },
  rose: { main: "#e11d48", soft: "#ffe4e6", strong: "#be123c" },
  red: { main: "#dc2626", soft: "#fee2e2", strong: "#b91c1c" },
  pink: { main: "#db2777", soft: "#fce7f3", strong: "#be185d" },
  fuchsia: { main: "#c026d3", soft: "#fae8ff", strong: "#a21caf" },
  purple: { main: "#9333ea", soft: "#f3e8ff", strong: "#7e22ce" },
  violet: { main: "#7c3aed", soft: "#ede9fe", strong: "#6d28d9" },
  lime: { main: "#65a30d", soft: "#ecfccb", strong: "#4d7c0f" },
  slate: { main: "#475569", soft: "#f1f5f9", strong: "#334155" },
};

const PROFILE_NAV_SECTION_TONE_MAP = {
  overview: "indigo",
  "my-products": "sky",
  "my-sales": "emerald",
  "my-orders": "blue",
  auction: "amber",
  "installment-payments": "teal",
  "installment-sales": "cyan",
  subscriptions: "violet",
  wishlist: "rose",
  "data-confirmation": "green",
  premium: "gold",
  "loyalty-points": "pink",
  advertising: "orange",
  "edit-profile": "slate",
  "create-raffle": "purple",
  "product-moderation": "orange",
  "intro-ad-moderation": "amber",
  "seller-personal-category-moderation": "teal",
  "product-reports": "rose",
  "product-promotions": "sky",
  raffles: "fuchsia",
  "data-confirmation-requests": "lime",
  "installment-moderation": "indigo",
  "installment-disputes": "red",
  "admin-orders": "blue",
  "search-synonyms-admin": "sky",
  "category-tree-admin": "emerald",
  "app-intro-admin": "violet",
  "site-header-banner-admin": "cyan",
  "popular-products-admin": "amber",
  logout: "rose",
} as const satisfies Partial<Record<ProfileSectionId | "logout", ProfileNavToneId>>;

export const resolveProfileNavSectionTone = (
  sectionId: ProfileSectionId | "logout",
): ProfileNavToneId => PROFILE_NAV_SECTION_TONE_MAP[sectionId] ?? "slate";

export const resolveProfileNavTonePalette = (
  tone: ProfileNavToneId,
): ProfileNavTonePalette => PROFILE_NAV_TONE_PALETTE[tone] ?? PROFILE_NAV_TONE_PALETTE.slate;
