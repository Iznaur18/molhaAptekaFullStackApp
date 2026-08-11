import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { useMarkInAppNotificationsReadMutation } from "../../../entities/user/model/useMarkInAppNotificationsReadMutation.js";
import {
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT,
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT,
  IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER,
} from "../../../entities/user-follow/model/constants.js";
import { useInAppNotificationsPoll } from "../lib/useInAppNotificationsPoll.js";

/** @typedef {import('../../../entities/product-report/model/types.js').UserInAppNotification} UserInAppNotification */

/**
 * Mark-as-read on leave (not on enter): list stays visible while the page is open.
 * Enter-mark + cache clear was wiping the UI before/while render.
 *
 * @param {object} params
 */
export const useHomeNotifications = ({
  isAuthorized,
  mainView,
  goToMainView,
  setIsLoginModalOpen,
  handleSellerNameClick,
  inAppNotifications,
  invalidateAuthMe,
  patchAuthMeNotifications,
}) => {
  const navigate = useNavigate();
  const { mutate: markNotificationsRead } = useMarkInAppNotificationsReadMutation();
  const isNotificationsView = mainView === "notifications" && isAuthorized;
  const wasNotificationsViewRef = useRef(false);

  const refreshInAppNotifications = useCallback(async () => {
    if (!isAuthorized) {
      return;
    }
    await invalidateAuthMe();
  }, [invalidateAuthMe, isAuthorized]);

  useInAppNotificationsPoll({
    isAuthorized,
    mainView,
  });

  useEffect(() => {
    if (isNotificationsView) {
      wasNotificationsViewRef.current = true;
      return undefined;
    }

    if (!wasNotificationsViewRef.current) {
      return undefined;
    }
    wasNotificationsViewRef.current = false;

    markNotificationsRead(undefined, {
      onError: () => {
        // Keep unread in cache; poll / next authMe will refresh badge.
        void invalidateAuthMe();
      },
    });

    return undefined;
  }, [invalidateAuthMe, isNotificationsView, markNotificationsRead]);

  const handleNotificationsClick = useCallback(() => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    goToMainView("notifications");
  }, [goToMainView, isAuthorized, setIsLoginModalOpen]);

  const handleNotificationsCleared = useCallback(() => {
    patchAuthMeNotifications([]);
  }, [patchAuthMeNotifications]);

  const clearInAppNotifications = useCallback(() => {
    patchAuthMeNotifications([]);
  }, [patchAuthMeNotifications]);

  /**
   * @param {UserInAppNotification} item
   */
  const handleInAppNotificationClick = useCallback(
    (item) => {
      if (item.kind === IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER && item.actorUserId) {
        handleSellerNameClick(item.actorUserId);
        return;
      }
      if (
        (item.kind === IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT ||
          item.kind === IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT) &&
        item.productId
      ) {
        navigateToProductDetails(navigate, item.productId);
        return;
      }
      if (item.productId) {
        navigateToProductDetails(navigate, item.productId);
      }
    },
    [handleSellerNameClick, navigate],
  );

  const notificationsPageItems = isNotificationsView ? inAppNotifications : [];

  return {
    inAppNotifications,
    notificationsPageItems,
    refreshInAppNotifications,
    handleNotificationsClick,
    handleNotificationsCleared,
    handleInAppNotificationClick,
    clearInAppNotifications,
  };
};
