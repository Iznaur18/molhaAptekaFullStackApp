import {
  Bell,
  Cake,
  Calendar,
  Camera,
  Crown,
  Globe,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Play,
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
  socialTelegramUrl: MessageCircle,
  socialInstagramUrl: Camera,
  socialVkUrl: Users,
  socialYoutubeUrl: Play,
  socialWhatsappUrl: MessageSquare,
  socialWebsiteUrl: Globe,
  socialLinkFallback: Link2,
};

/**
 * @param {string} rowId
 * @returns {LucideIcon | null}
 */
export function getProfileRowIcon(rowId) {
  return PROFILE_ROW_ICONS[rowId] ?? null;
}
