import { useState } from "react";

import { markInAppNotificationsRead } from "../../../entities/user/api/markInAppNotificationsRead.js";
import {
  API_CLIENT_UI,
  NOTIFICATIONS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./NotificationsPage.css";

/**
 * @param {{
 *   notifications: import('../../../entities/product-report/model/types.js').UserInAppNotification[];
 *   onNotificationClick: (item: import('../../../entities/product-report/model/types.js').UserInAppNotification) => void;
 *   onCleared: () => void;
 * }} props
 */
export function NotificationsPage({ notifications, onNotificationClick, onCleared }) {
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState("");

  const handleClear = async () => {
    if (notifications.length === 0 || isClearing) {
      return;
    }
    try {
      setIsClearing(true);
      setClearError("");
      await markInAppNotificationsRead();
      onCleared();
    } catch (e) {
      setClearError(
        e instanceof Error ? e.message : API_CLIENT_UI.MARK_NOTIFICATIONS_READ_FALLBACK,
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page__toolbar">
        <button
          type="button"
          className="notifications-page__clear"
          disabled={notifications.length === 0 || isClearing}
          aria-label={NOTIFICATIONS_PAGE_UI.CLEAR_ARIA}
          onClick={() => void handleClear()}
        >
          {isClearing
            ? NOTIFICATIONS_PAGE_UI.CLEAR_PENDING
            : NOTIFICATIONS_PAGE_UI.CLEAR}
        </button>
      </div>
      {clearError ? (
        <p className="notifications-page__error" role="alert">
          {clearError}
        </p>
      ) : null}
      {notifications.length === 0 ? (
        <p className="notifications-page__empty">{NOTIFICATIONS_PAGE_UI.EMPTY}</p>
      ) : (
        <ul className="notifications-page__list" role="list">
          {notifications.map((item) => (
            <li key={item._id} className="notifications-page__item" role="listitem">
              <button
                type="button"
                className="notifications-page__item-btn"
                onClick={() => onNotificationClick(item)}
              >
                {item.message}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
