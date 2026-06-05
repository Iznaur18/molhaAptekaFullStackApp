import { formatPremiumExpiresAtForInput } from "./formatPremiumExpiresAtForInput.js";
import { isPremiumActive } from "./isPremiumActive.js";

/** @type {readonly number[]} */
export const STAFF_PREMIUM_PRESET_MONTHS = [1, 3, 6, 12];

/**
 * @param {Date | string | number} fromDate
 * @param {number} months
 */
export function addCalendarMonths(fromDate, months) {
  const date = new Date(fromDate);
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 */
export function getStaffPremiumExtensionBaseDate(user) {
  if (isPremiumActive(user) && user?.premiumExpiresAt) {
    const expiresAt = new Date(user.premiumExpiresAt);
    if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now()) {
      return expiresAt;
    }
  }
  return new Date();
}

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @param {number} months
 */
export function computeStaffPremiumExpiresAtInput(user, months) {
  const base = getStaffPremiumExtensionBaseDate(user);
  return formatPremiumExpiresAtForInput(addCalendarMonths(base, months));
}

/**
 * @param {string | null | undefined} premiumExpiresAt
 */
export function isPremiumExpiresAtInputActive(premiumExpiresAt) {
  const raw = String(premiumExpiresAt ?? "").trim();
  if (!raw) {
    return false;
  }
  const expiresAt = new Date(raw).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/**
 * @param {string | Date | null | undefined} value
 */
export function formatPremiumExpiresAtDisplay(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
