import { useCallback, useEffect, useRef } from "react";

import { useEnsureCatalogProduct } from "../../../entities/product/model/useEnsureCatalogProduct.js";
import { useMarkInAppNotificationsReadMutation } from "../../../entities/user/model/useMarkInAppNotificationsReadMutation.js";
import {
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT,
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT,
  IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER,
} from "../../../entities/user-follow/model/constants.js";
import { useInAppNotificationsPoll } from "../lib/useInAppNotificationsPoll.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} params
 */
export const useHomeNotifications = ({
  isAuthorized,
  mainView,
  goToMainView,
  setIsLoginModalOpen,
  handleSellerNameClick,
  products,
  setCatalogProductDetails,
  inAppNotifications,
  invalidateAuthMe,
  patchAuthMeNotifications,
}) => {
  const ensureCatalogProduct = useEnsureCatalogProduct();
  const { mutate: markNotificationsRead } = useMarkInAppNotificationsReadMutation();
  const isNotificationsView = mainView === "notifications" && isAuthorized;
  const markedReadRef = useRef(false);

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
    markedReadRef.current = false;
  }, [isNotificationsView]);

  useEffect(() => {
    if (!isNotificationsView || inAppNotifications.length === 0 || markedReadRef.current) {
      return undefined;
    }

    markedReadRef.current = true;

    markNotificationsRead(undefined, {
      onSuccess: () => {
        patchAuthMeNotifications([]);
        void invalidateAuthMe();
      },
      onError: () => {
        patchAuthMeNotifications([]);
      },
    });

    return undefined;
  }, [
    inAppNotifications.length,
    invalidateAuthMe,
    isNotificationsView,
    markNotificationsRead,
    patchAuthMeNotifications,
  ]);

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
   * @param {import('../../../entities/product-report/model/types.js').UserInAppNotification} item
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
        goToMainView("catalog");
        const inList = products.find((p) => String(p._id) === String(item.productId));
        if (inList) {
          setCatalogProductDetails(inList);
          return;
        }
        void ensureCatalogProduct(String(item.productId))
          .then((found) => {
            setCatalogProductDetails(found);
          })
          .catch(() => {
            // каталог открыт без модалки
          });
      }
    },
    [
      ensureCatalogProduct,
      goToMainView,
      handleSellerNameClick,
      products,
      setCatalogProductDetails,
    ],
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
