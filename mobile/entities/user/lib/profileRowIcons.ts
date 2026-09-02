import type { ComponentProps } from "react";
import type { Feather } from "@expo/vector-icons";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

export const PROFILE_ROW_ICONS: Record<string, FeatherIconName> = {
  userName: "user",
  followersCount: "users",
  followingCount: "user-check",
  email: "mail",
  userBirthDate: "gift",
  userGender: "user",
  userVehicleMake: "truck",
  userVehicleColor: "droplet",
  userVehiclePlate: "hash",
  userAddress: "map-pin",
  userPhoneNumber: "phone",
  isUserDataConfirmed: "shield",
  notificationsEnabled: "bell",
  isPremiumUser: "award",
  userLoyaltyPoints: "zap",
  totalSalesCount: "shopping-bag",
  totalSalesAmount: "dollar-sign",
  totalPurchasesAmount: "shopping-cart",
  userBusinessHours: "clock",
  userRatingByVotes: "star",
  createdAt: "calendar",
  socialTelegramUrl: "send",
  socialInstagramUrl: "camera",
  socialVkUrl: "users",
  socialYoutubeUrl: "play",
  socialWhatsappUrl: "message-circle",
  socialWebsiteUrl: "globe",
};

export const getProfileRowIcon = (rowId: string): FeatherIconName | null =>
  PROFILE_ROW_ICONS[rowId] ?? null;
