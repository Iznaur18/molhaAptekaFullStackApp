import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { CART_PAGE_UI } from "@/shared/config";

const TAB_ICON_SIZE = 24;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const cartCount = useCartTotalCount();
  const cartBadge = cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : undefined;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
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
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
