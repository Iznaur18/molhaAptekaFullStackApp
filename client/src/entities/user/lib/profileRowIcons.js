import {
  Award,
  BadgeCheck,
  Bell,
  Cake,
  Calendar,
  Camera,
  Car,
  Clock,
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
  Star,
  Ticket,
  User,
  UserCircle,
  Users,
} from "lucide-react";

/** @typedef {import("lucide-react").LucideIcon} LucideIcon */

/** @type {Record<string, LucideIcon>} */
export const PROFILE_ROW_ICONS = {
  userName: User,
  userFullName: BadgeCheck,
  followersCount: User,
  followingCount: Users,
  email: Mail,
  userBirthDate: Cake,
  userGender: UserCircle,
  userVehicleMake: Car,
  userVehicleColor: Car,
  userVehiclePlate: Car,
  userAddress: MapPin,
  userPhoneNumber: Phone,
  isUserDataConfirmed: ShieldCheck,
  notificationsEnabled: Bell,
  isPremiumUser: Crown,
  userLoyaltyPoints: Award,
  totalSalesCount: ShoppingBag,
  totalSalesAmount: Ticket,
  totalPurchasesAmount: ShoppingCart,
  userBusinessHours: Clock,
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
