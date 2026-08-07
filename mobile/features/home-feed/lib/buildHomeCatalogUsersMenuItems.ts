import type { ComponentProps } from "react";
import type MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { HEADER_USERS_BUTTON_UI } from "@/shared/config";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export type HomeCatalogUsersMenuItemKey = "users" | "terms" | "faq" | "notifications";

export type HomeCatalogUsersMenuItemHref =
  | "/users"
  | "/legal/terms"
  | "/faq"
  | "/notifications";

export type HomeCatalogUsersMenuItem = {
  key: HomeCatalogUsersMenuItemKey;
  icon: MaterialIconName;
  accessibilityLabel: string;
  href?: HomeCatalogUsersMenuItemHref;
};

export const buildHomeCatalogUsersMenuItems = (): HomeCatalogUsersMenuItem[] => [
  {
    key: "users",
    icon: "people",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_USERS_ARIA,
    href: "/users",
  },
  {
    key: "terms",
    icon: "article",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_TERMS_ARIA,
    href: "/legal/terms",
  },
  {
    key: "faq",
    icon: "quiz",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_FAQ_ARIA,
    href: "/faq",
  },
  {
    key: "notifications",
    icon: "notifications",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_NOTIFICATIONS_ARIA,
    href: "/notifications",
  },
];
