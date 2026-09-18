import { useEffect, useRef } from "react";

import { trackCheckoutStarted } from "../../../entities/analytics/api/trackClientAnalyticsEvent.js";

/**
 * Шаг воронки «начал оформление»: один запрос за жизнь страницы, только для
 * вошедшего пользователя (гостю оформление недоступно).
 *
 * @param {boolean} checkoutOpen
 * @param {string | null} currentUserId
 */
export function useTrackCheckoutStarted(checkoutOpen, currentUserId) {
  const trackedForUserRef = useRef(/** @type {string | null} */ (null));

  useEffect(() => {
    if (!checkoutOpen || !currentUserId) {
      return;
    }
    if (trackedForUserRef.current === currentUserId) {
      return;
    }
    trackedForUserRef.current = currentUserId;
    void trackCheckoutStarted();
  }, [checkoutOpen, currentUserId]);
}
