import { useState } from "react";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { useMarkInAppNotificationsReadMutation } from "../../../entities/user/model/useMarkInAppNotificationsReadMutation.js";
import {
  API_CLIENT_UI,
  NOTIFICATIONS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { InlineErrorBanner } from "../../../shared/ui/InlineErrorBanner/InlineErrorBanner.jsx";

import "./NotificationsPage.css";

/**
 * @param {{
 *   notifications: import('../../../entities/product-report/model/types.js').UserInAppNotification[];
 *   onNotificationClick: (item: import('../../../entities/product-report/model/types.js').UserInAppNotification) => void;
 *   onCleared: () => void;
 * }} props
 */
export function NotificationsPage({ notifications, onNotificationClick, onCleared }) {
  const markReadMutation = useMarkInAppNotificationsReadMutation();
  const [clearError, setClearError] = useState("");

  const handleClear = async () => {
    if (notifications.length === 0 || markReadMutation.isPending) {
      return;
    }
    try {
      setClearError("");
      await markReadMutation.mutateAsync();
      onCleared();
    } catch (e) {
      setClearError(
        formatApiErrorMessage(e, API_CLIENT_UI.MARK_NOTIFICATIONS_READ_FALLBACK),
      );
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page__toolbar">
        <button
          type="button"
          className="notifications-page__clear"
          disabled={notifications.length === 0 || markReadMutation.isPending}
          aria-label={NOTIFICATIONS_PAGE_UI.CLEAR_ARIA}
          onClick={() => void handleClear()}
        >
          {markReadMutation.isPending
            ? NOTIFICATIONS_PAGE_UI.CLEAR_PENDING
            : NOTIFICATIONS_PAGE_UI.CLEAR}
        </button>
      </div>
      {clearError ? <InlineErrorBanner>{clearError}</InlineErrorBanner> : null}
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
