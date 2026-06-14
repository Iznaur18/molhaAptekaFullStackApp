import type { Href } from "expo-router";

import type { InAppNotification } from "@/entities/notification/model/useInAppNotifications";

import { resolveNotificationRoute } from "./resolveNotificationRoute";

export const resolveInAppNotificationRoute = (item: InAppNotification): Href | null =>
  resolveNotificationRoute({
    kind: item.kind,
    productId: item.productId,
    actorUserId: item.actorUserId,
    notificationId: item._id,
  });
