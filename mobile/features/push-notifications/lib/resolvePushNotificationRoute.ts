import type { Href } from "expo-router";

import { resolveNotificationRoute } from "@/entities/notification/lib/resolveNotificationRoute";

export type PushNotificationData = {
  kind?: string;
  productId?: string;
  actorUserId?: string;
  notificationId?: string;
};

export const resolvePushNotificationRoute = (
  data: PushNotificationData | null | undefined,
): Href | null => resolveNotificationRoute(data);
