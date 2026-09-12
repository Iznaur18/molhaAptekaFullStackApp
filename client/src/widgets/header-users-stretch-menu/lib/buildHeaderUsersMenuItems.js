import { BadgeHelp, MapPin, Newspaper, Users } from "../../../shared/ui/icon/index.js";
import {
  HEADER_USERS_BUTTON_UI,
  REGION_UI,
} from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {"users" | "terms" | "faq" | "region"} HeaderUsersMenuItemKey
 * @typedef {"users" | "terms" | "faq" | "region"} HeaderUsersMenuItemAction
 *
 * @typedef {{
 *   key: HeaderUsersMenuItemKey;
 *   icon: import("lucide-react").LucideIcon;
 *   accessibilityLabel: string;
 *   action?: HeaderUsersMenuItemAction;
 * }} HeaderUsersMenuItem
 */

/**
 * @param {{ includeRegion?: boolean }} [options]
 * @returns {HeaderUsersMenuItem[]}
 */
export function buildHeaderUsersMenuItems({ includeRegion = false } = {}) {
  /** @type {HeaderUsersMenuItem[]} */
  const items = [
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
  ];

  if (includeRegion) {
    items.push({
      key: "region",
      icon: MapPin,
      accessibilityLabel: REGION_UI.VIEWER_ARIA,
      action: "region",
    });
  }

  return items;
}
