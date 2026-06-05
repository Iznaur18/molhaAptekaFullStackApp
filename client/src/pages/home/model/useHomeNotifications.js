import { useCallback, useEffect, useState } from "react";

import { fetchCatalogProductsPage } from "../../../entities/product/api/fetchCatalogProductsPage.js";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { markInAppNotificationsRead } from "../../../entities/user/api/markInAppNotificationsRead.js";
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
}) => {
  const [inAppNotifications, setInAppNotifications] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').UserInAppNotification[]} */ ([]),
  );
  const [notificationsPageItems, setNotificationsPageItems] = useState(
    /** @type {import('../../../entities/product-report/model/types.js').UserInAppNotification[]} */ ([]),
  );

  const refreshInAppNotifications = useCallback(async () => {
    if (!isAuthorized) {
      setInAppNotifications([]);
      return;
    }
    try {
      const { inAppNotifications: notifications } = await fetchCurrentUserProfile();
      setInAppNotifications(notifications);
    } catch {
      setInAppNotifications([]);
    }
  }, [isAuthorized]);

  useInAppNotificationsPoll({
    isAuthorized,
    mainView,
    refreshInAppNotifications,
  });

  useEffect(() => {
    if (mainView !== "notifications" || !isAuthorized) {
      setNotificationsPageItems([]);
      return undefined;
    }

    let isCancelled = false;
    void (async () => {
      try {
        const { inAppNotifications: list } = await fetchCurrentUserProfile();
        if (isCancelled) {
          return;
        }
        setNotificationsPageItems(list);
        if (list.length > 0) {
          await markInAppNotificationsRead();
        }
        if (!isCancelled) {
          setInAppNotifications([]);
        }
      } catch {
        if (!isCancelled) {
          setNotificationsPageItems([]);
          setInAppNotifications([]);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [mainView, isAuthorized]);

  const handleNotificationsClick = useCallback(() => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    goToMainView("notifications");
  }, [goToMainView, isAuthorized, setIsLoginModalOpen]);

  const handleNotificationsCleared = useCallback(() => {
    setInAppNotifications([]);
    setNotificationsPageItems([]);
  }, []);

  const clearInAppNotifications = useCallback(() => {
    setInAppNotifications([]);
  }, []);

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
        void (async () => {
          try {
            const { products: pageProducts } = await fetchCatalogProductsPage({
              page: 1,
              limit: 100,
            });
            const found = pageProducts.find(
              (p) => String(p._id) === String(item.productId),
            );
            if (found) {
              setCatalogProductDetails(found);
            }
          } catch {
            // каталог открыт без модалки
          }
        })();
      }
    },
    [goToMainView, handleSellerNameClick, products, setCatalogProductDetails],
  );

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
