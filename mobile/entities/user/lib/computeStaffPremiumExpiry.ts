import { formatPremiumExpiresAtForInput } from "./formatPremiumExpiresAtForInput";
import { isPremiumActive } from "./isPremiumActive";

export const STAFF_PREMIUM_PRESET_MONTHS = [1, 3, 6, 12] as const;

const addCalendarMonths = (fromDate: Date | string | number, months: number): Date => {
  const date = new Date(fromDate);
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const getStaffPremiumExtensionBaseDate = (
  user: Record<string, unknown> | null | undefined,
): Date => {
  if (isPremiumActive(user) && user?.premiumExpiresAt) {
    const expiresAt = new Date(String(user.premiumExpiresAt));
    if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now()) {
      return expiresAt;
    }
  }
  return new Date();
};

export const computeStaffPremiumExpiresAtInput = (
  user: Record<string, unknown> | null | undefined,
  months: number,
): string => {
  const base = getStaffPremiumExtensionBaseDate(user);
  return formatPremiumExpiresAtForInput(addCalendarMonths(base, months));
};

export const isPremiumExpiresAtInputActive = (premiumExpiresAt: string | null | undefined): boolean => {
  const raw = String(premiumExpiresAt ?? "").trim();
  if (!raw) {
    return false;
  }
  const expiresAt = new Date(raw).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
};

export const formatPremiumExpiresAtDisplay = (value: string | Date | null | undefined): string => {
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
};
