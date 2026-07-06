import type { ComponentProps } from "react";
import type MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { HEADER_USERS_BUTTON_UI } from "@/shared/config";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export type HomeCatalogUsersMenuItemKey =
  | "users"
  | "placeholder-1"
  | "placeholder-2"
  | "placeholder-3";

export type HomeCatalogUsersMenuItem = {
  key: HomeCatalogUsersMenuItemKey;
  icon: MaterialIconName;
  accessibilityLabel: string;
  href?: "/users";
};

export const buildHomeCatalogUsersMenuItems = (): HomeCatalogUsersMenuItem[] => [
  {
    key: "users",
    icon: "people",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_USERS_ARIA,
    href: "/users",
  },
  {
    key: "placeholder-1",
    icon: "help-outline",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_PLACEHOLDER_ARIA(1),
  },
  {
    key: "placeholder-2",
    icon: "help-outline",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_PLACEHOLDER_ARIA(2),
  },
  {
    key: "placeholder-3",
    icon: "help-outline",
    accessibilityLabel: HEADER_USERS_BUTTON_UI.MENU_ITEM_PLACEHOLDER_ARIA(3),
  },
];
