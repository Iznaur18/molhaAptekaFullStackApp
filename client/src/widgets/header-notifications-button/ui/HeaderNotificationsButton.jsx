import {
  HEADER_NOTIFICATIONS_BUTTON_UI,
} from "../../../shared/config/appUiCopy.js";

import "./HeaderNotificationsButton.css";

/**
 * @param {{ onClick: () => void; isActive?: boolean; unreadCount?: number }} props
 */
export function HeaderNotificationsButton({
  onClick,
  isActive = false,
  unreadCount = 0,
}) {
  const hasUnread = unreadCount > 0;
  const className = [
    "header-notifications-button",
    isActive && "header-notifications-button--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={HEADER_NOTIFICATIONS_BUTTON_UI.ARIA}
      aria-current={isActive ? "page" : undefined}
    >
      <svg
        className="header-notifications-button__icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-8.24V11a7 7 0 10-14 0v2.76l-1.55 1.55A1 1 0 003 15.5V16a1 1 0 001 1h16a1 1 0 001-1v-.5a1 1 0 00-.45-.84L19 13.76z" />
      </svg>
      {hasUnread ? (
        <span
          className="header-notifications-button__badge"
          aria-label={HEADER_NOTIFICATIONS_BUTTON_UI.COUNT_ARIA}
        >
          {HEADER_NOTIFICATIONS_BUTTON_UI.BADGE(unreadCount)}
        </span>
      ) : null}
    </button>
  );
}
