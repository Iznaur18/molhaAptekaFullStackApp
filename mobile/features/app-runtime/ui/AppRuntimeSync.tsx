import { useInAppNotificationsPoll } from "@/entities/notification/model/useInAppNotificationsPoll";
import { useAppDeepLinking } from "@/features/deep-linking/model/useAppDeepLinking";
import { useRemotePushRegistration } from "@/features/push-notifications/model/useRemotePushRegistration";

export const AppRuntimeSync = () => {
  useInAppNotificationsPoll();
  useAppDeepLinking();
  useRemotePushRegistration();
  return null;
};
