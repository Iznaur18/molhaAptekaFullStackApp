import { BadgeHelp, Bell, Newspaper, Users } from "../../../shared/ui/icon/index.js";
import { HEADER_USERS_BUTTON_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {"users" | "terms" | "faq" | "notifications"} HeaderUsersMenuItemKey
 * @typedef {"users" | "terms" | "faq" | "notifications"} HeaderUsersMenuItemAction
 *
 * @typedef {{
 *   key: HeaderUsersMenuItemKey;
 *   icon: import("lucide-react").LucideIcon;
 *   accessibilityLabel: string;
 *   action?: HeaderUsersMenuItemAction;
 * }} HeaderUsersMenuItem
 */

/** @returns {HeaderUsersMenuItem[]} */
export function buildHeaderUsersMenuItems() {
  return [
    {
      key: "users",
      icon: Users,
      accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_USERS_ARIA,
      action: "users",
    },
    {
      key: "terms",
      icon: Newspaper,
      accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_TERMS_ARIA,
      action: "terms",
    },
    {
      key: "faq",
      icon: BadgeHelp,
      accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_FAQ_ARIA,
      action: "faq",
    },
    {
      key: "notifications",
      icon: Bell,
      accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_NOTIFICATIONS_ARIA,
      action: "notifications",
    },
  ];
}
