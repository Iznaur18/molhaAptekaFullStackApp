import {
  Bell,
  Cake,
  Calendar,
  Crown,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  User,
  UserCheck,
  Users,
  UserCircle,
} from "lucide-react";

/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @type {Record<string, LucideIcon>} */
export const PROFILE_ROW_ICONS = {
  userName: User,
  followersCount: Users,
  followingCount: UserCheck,
  email: Mail,
  userBirthDate: Cake,
  userGender: UserCircle,
  userAddress: MapPin,
  userPhoneNumber: Phone,
  isUserDataConfirmed: ShieldCheck,
  notificationsEnabled: Bell,
  isPremiumUser: Crown,
  userLoyaltyPoints: Sparkles,
  totalSalesCount: ShoppingBag,
  totalSalesAmount: Wallet,
  totalPurchasesAmount: ShoppingCart,
  userRatingByVotes: Star,
  createdAt: Calendar,
};

/**
 * @param {string} rowId
 * @returns {LucideIcon | null}
 */
export function getProfileRowIcon(rowId) {
  return PROFILE_ROW_ICONS[rowId] ?? null;
}
