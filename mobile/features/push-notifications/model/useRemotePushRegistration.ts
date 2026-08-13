import Constants from "expo-constants";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import {
  registerPushToken,
  removePushToken,
  type PushTokenPlatform,
} from "@/entities/push-token/api/pushTokenApi";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import {
  canUseExpoNotificationsModule,
  getExpoNotificationsModule,
} from "@/features/push-notifications/lib/expoNotificationsModule";
import { resolvePushNotificationRoute } from "@/features/push-notifications/lib/resolvePushNotificationRoute";
import type { PushNotificationData } from "@/features/push-notifications/lib/resolvePushNotificationRoute";

const Notifications = getExpoNotificationsModule();

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const resolvePushPlatform = (): PushTokenPlatform => {
  if (Platform.OS === "ios") {
    return "ios";
  }
  if (Platform.OS === "android") {
    return "android";
  }
  return "web";
};

const resolveExpoProjectId = (): string | undefined => {
  const easProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof easProjectId === "string" && easProjectId.trim()) {
    return easProjectId.trim();
  }
  return Constants.easConfig?.projectId;
};

const requestNativePushToken = async (): Promise<string | null> => {
  const notifications = getExpoNotificationsModule();
  if (!notifications || !Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync("default", {
      name: "Torgum",
      importance: notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = resolveExpoProjectId();
  const tokenResponse = await notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  return tokenResponse.data?.trim() || null;
};

const parsePushData = (raw: unknown): PushNotificationData | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return raw as PushNotificationData;
};

const resolveRouteFromNotificationResponse = (
  response: {
    notification: { request: { content: { data: unknown } } };
  } | null | undefined,
) => {
  if (!response) {
    return null;
  }
  return resolvePushNotificationRoute(
    parsePushData(response.notification.request.content.data),
  );
};

const openColdStartNotificationRoute = async (
  router: ReturnType<typeof useRouter>,
): Promise<void> => {
  const notifications = getExpoNotificationsModule();
  if (!notifications) {
    return;
  }

  try {
    const response = await notifications.getLastNotificationResponseAsync();
    const route = resolveRouteFromNotificationResponse(response);
    if (route) {
      router.push(route);
    }
  } catch (error) {
    console.warn("useRemotePushRegistration cold-start error:", error);
  }
};

export const useRemotePushRegistration = (): void => {
  const isAuthorized = useIsAuthorized();
  const router = useRouter();
  const registeredTokenRef = useRef<string | null>(null);
  const responseListenerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!canUseExpoNotificationsModule()) {
      return;
    }

    if (!isAuthorized) {
      const token = registeredTokenRef.current;
      if (token) {
        void removePushToken(token);
        registeredTokenRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const syncToken = async () => {
      try {
        const token = await requestNativePushToken();
        if (!token || cancelled) {
          return;
        }
        if (registeredTokenRef.current === token) {
          return;
        }
        await registerPushToken(token, resolvePushPlatform());
        registeredTokenRef.current = token;
      } catch (error) {
        console.warn("useRemotePushRegistration sync error:", error);
      }
    };

    void syncToken();

    return () => {
      cancelled = true;
    };
  }, [isAuthorized]);

  useEffect(() => {
    const notifications = getExpoNotificationsModule();
    if (!notifications) {
      return undefined;
    }

    responseListenerRef.current = notifications.addNotificationResponseReceivedListener(
      (response) => {
        const route = resolveRouteFromNotificationResponse(response);
        if (route) {
          router.push(route);
        }
      },
    );

    void openColdStartNotificationRoute(router);

    return () => {
      responseListenerRef.current?.remove();
      responseListenerRef.current = null;
    };
  }, [router]);
};
