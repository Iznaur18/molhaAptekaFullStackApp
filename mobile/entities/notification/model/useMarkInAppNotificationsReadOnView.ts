import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";

import { useInAppNotifications } from "./useInAppNotifications";
import { useMarkInAppNotificationsReadMutation } from "./useMarkInAppNotificationsReadMutation";

export const useMarkInAppNotificationsReadOnView = (enabled: boolean): void => {
  const notifications = useInAppNotifications();
  const markReadMutation = useMarkInAppNotificationsReadMutation();
  const markedReadRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      markedReadRef.current = false;

      return () => {
        markedReadRef.current = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (
        !enabled ||
        notifications.length === 0 ||
        markedReadRef.current ||
        markReadMutation.isPending
      ) {
        return;
      }

      markedReadRef.current = true;

      void markReadMutation.mutateAsync().catch(() => {
        markedReadRef.current = false;
      });
    }, [enabled, markReadMutation, notifications.length]),
  );
};
