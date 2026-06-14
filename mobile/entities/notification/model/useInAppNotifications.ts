import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";

export type InAppNotification = {
  _id: string;
  kind: string;
  message: string;
  productId?: string | null;
  actorUserId?: string | null;
  createdAt: string;
};

export const useInAppNotifications = (): InAppNotification[] => {
  const sessionQuery = useAuthSessionQuery();
  const raw = sessionQuery.data?.inAppNotifications;
  return Array.isArray(raw) ? (raw as InAppNotification[]) : [];
};

export const useUnreadNotificationsCount = (): number => useInAppNotifications().length;
