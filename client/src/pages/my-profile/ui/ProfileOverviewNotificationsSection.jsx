import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { NotificationsPage } from "../../notifications/ui/NotificationsPage.jsx";

import "./ProfileOverviewNotificationsSection.css";

/**
 * @param {{
 *   notifications: import('../../../entities/product-report/model/types.js').UserInAppNotification[];
 *   onNotificationClick: (item: import('../../../entities/product-report/model/types.js').UserInAppNotification) => void;
 *   onCleared: () => void;
 * }} props
 */
export function ProfileOverviewNotificationsSection({
  notifications,
  onNotificationClick,
  onCleared,
}) {
  return (
    <section
      className="profile-overview-notifications"
      aria-label={HOME_PAGE_UI.TITLE_NOTIFICATIONS}
    >
      <h3 className="profile-overview-notifications__title">
        {HOME_PAGE_UI.TITLE_NOTIFICATIONS}
      </h3>
      <NotificationsPage
        embedded
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onCleared={onCleared}
      />
    </section>
  );
}
