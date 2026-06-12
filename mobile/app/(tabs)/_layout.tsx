import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { CART_PAGE_UI } from "@/shared/config";

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
            <SymbolView
              name={{
                ios: "square.grid.2x2",
                android: "grid_view",
                web: "grid_view",
              }}
              tintColor={color}
              size={Platform.OS === "ios" ? 26 : 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: CART_PAGE_UI.TITLE,
          tabBarBadge: cartBadge,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "cart",
                android: "shopping_cart",
                web: "shopping_cart",
              }}
              tintColor={color}
              size={Platform.OS === "ios" ? 26 : 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "person.circle",
                android: "person",
                web: "person",
              }}
              tintColor={color}
              size={Platform.OS === "ios" ? 26 : 24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
