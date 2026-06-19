import { Tabs } from "expo-router";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import {
  CART_PAGE_UI,
  CATALOG_BROWSER_UI,
  HUB_SECTION_UI,
  MOBILE_BOTTOM_NAV_UI,
  MY_ORDERS_PAGE_UI,
  MY_PROFILE_PAGE_UI,
  USERS_PAGE_UI,
} from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { MobileBottomTabBar } from "@/shared/ui/MobileBottomTabBar";

export default function TabLayout() {
  const { theme } = useAppThemeSettings();

  return (
    <Tabs
      tabBar={(props) => <MobileBottomTabBar {...props} />}
      screenOptions={{
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: MOBILE_BOTTOM_NAV_UI.TAB_HOME,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: CATALOG_BROWSER_UI.TITLE,
        }}
      />
      <Tabs.Screen
        name="hub/[section]"
        options={{
          href: null,
          title: HUB_SECTION_UI.SCREEN_TITLE,
        }}
      />
      <Tabs.Screen
        name="place-product"
        options={{
          href: null,
          title: MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: CART_PAGE_UI.TITLE,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null,
          title: MY_ORDERS_PAGE_UI.TITLE,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: null,
          title: USERS_PAGE_UI.TITLE,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: MY_PROFILE_PAGE_UI.TAB_TITLE,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
