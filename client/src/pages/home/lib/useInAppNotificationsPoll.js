import { useEffect } from "react";

export const IN_APP_NOTIFICATIONS_POLL_MS = 30_000;

/**
 * @param {{
 *   isAuthorized: boolean;
 *   mainView: string;
 *   refreshInAppNotifications: () => Promise<void>;
 * }} params
 */
export function useInAppNotificationsPoll({
  isAuthorized,
  mainView,
  refreshInAppNotifications,
}) {
  useEffect(() => {
    if (!isAuthorized || mainView === "notifications") {
      return undefined;
    }

    void refreshInAppNotifications();

    const intervalId = window.setInterval(() => {
      void refreshInAppNotifications();
    }, IN_APP_NOTIFICATIONS_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [isAuthorized, mainView, refreshInAppNotifications]);

  useEffect(() => {
    if (!isAuthorized) {
      return undefined;
    }

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        mainView !== "notifications"
      ) {
        void refreshInAppNotifications();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isAuthorized, mainView, refreshInAppNotifications]);
}
