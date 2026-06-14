import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { useUnreadNotificationsCount } from "@/entities/notification/model/useInAppNotifications";
import { CART_PAGE_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

const TAB_ICON_SIZE = 24;

export default function TabLayout() {
  const { theme } = useAppThemeSettings();
  const cartCount = useCartTotalCount();
  const unreadNotifications = useUnreadNotificationsCount();
  const cartBadge = cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : undefined;
  const profileBadge =
    unreadNotifications > 0
      ? unreadNotifications > 99
        ? "99+"
        : unreadNotifications
      : undefined;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.action,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarBadgeStyle: {
          backgroundColor: theme.colors.danger,
          color: theme.colors.onContrast,
        },
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
          title: "Каталог",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="grid-view" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: CART_PAGE_UI.TITLE,
          tabBarBadge: cartBadge,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shopping-cart" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarBadge: profileBadge,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
