import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import {
  registerPushToken,
  removePushToken,
  type PushTokenPlatform,
} from "@/entities/push-token/api/pushTokenApi";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { resolvePushNotificationRoute } from "@/features/push-notifications/lib/resolvePushNotificationRoute";
import type { PushNotificationData } from "@/features/push-notifications/lib/resolvePushNotificationRoute";

if (Platform.OS !== "web") {
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
  if (Platform.OS === "web" || !Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "iziBuy",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = resolveExpoProjectId();
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
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

const isNativePushSupported = (): boolean => Platform.OS !== "web";

const resolveRouteFromNotificationResponse = (
  response: Notifications.NotificationResponse | null | undefined,
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
  if (!isNativePushSupported()) {
    return;
  }

  try {
    const response = await Notifications.getLastNotificationResponseAsync();
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
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
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
    if (!isNativePushSupported()) {
      return undefined;
    }

    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
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
