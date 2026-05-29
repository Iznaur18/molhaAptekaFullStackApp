import { HEADER_NOTIFICATIONS_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Bell } from "../../../shared/ui/icon/index.js";

/**
 * @param {{ onClick: () => void; isActive?: boolean; unreadCount?: number }} props
 */
export function HeaderNotificationsButton({
  onClick,
  isActive = false,
  unreadCount = 0,
}) {
  const hasUnread = unreadCount > 0;

  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HEADER_NOTIFICATIONS_BUTTON_UI.ARIA}
      icon={Bell}
      badgeContent={
        hasUnread ? HEADER_NOTIFICATIONS_BUTTON_UI.BADGE(unreadCount) : null
      }
      badgeAriaLabel={
        hasUnread ? HEADER_NOTIFICATIONS_BUTTON_UI.COUNT_ARIA : undefined
      }
      badgeVariant="alert"
    />
  );
}
