import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { useUnreadNotificationsCount } from "@/entities/notification/model/useInAppNotifications";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CART_PAGE_UI, MOBILE_BOTTOM_NAV_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { AppText } from "@/shared/ui/AppText";

const TAB_ICON_SIZE = 24;
const PLACE_PRODUCT_ROUTE = "place-product";

type TabItemConfig = {
  routeName: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  accessibilityLabel: string;
};

const TAB_ITEMS: TabItemConfig[] = [
  {
    routeName: "index",
    icon: "home",
    label: MOBILE_BOTTOM_NAV_UI.TAB_HOME,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_HOME_ARIA,
  },
  {
    routeName: "catalog",
    icon: "menu",
    label: MOBILE_BOTTOM_NAV_UI.TAB_CATALOG,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_CATALOG_ARIA,
  },
  {
    routeName: PLACE_PRODUCT_ROUTE,
    icon: "add",
    label: MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_ARIA,
  },
  {
    routeName: "cart",
    icon: "shopping-cart",
    label: MOBILE_BOTTOM_NAV_UI.TAB_CART,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_CART_ARIA,
  },
  {
    routeName: "profile",
    icon: "person",
    label: MOBILE_BOTTOM_NAV_UI.TAB_PROFILE,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_PROFILE_ARIA,
  },
];

const useTabBarStyles = createThemedStyles((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
  },
  itemActive: {
    backgroundColor: theme.colors.actionSurface,
  },
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.danger,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
}));

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

export const MobileBottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useTabBarStyles();
  const { theme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const cartCount = useCartTotalCount();
  const unreadNotifications = useUnreadNotificationsCount();
  const isAuthorized = sessionQuery.data?.user != null;

  const cartBadge = cartCount > 0 ? formatBadge(cartCount) : null;
  const profileBadge =
    unreadNotifications > 0 ? formatBadge(unreadNotifications) : null;

  const handlePress = (routeName: string) => {
    if (routeName === PLACE_PRODUCT_ROUTE) {
      if (!isAuthorized) {
        router.push("/(auth)/login");
        return;
      }
      router.push("/create-product");
      return;
    }

    const routeIndex = state.routes.findIndex((route) => route.name === routeName);
    if (routeIndex < 0) {
      return;
    }

    const route = state.routes[routeIndex];
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleLongPress = (routeName: string) => {
    if (routeName === PLACE_PRODUCT_ROUTE) {
      return;
    }

    const routeIndex = state.routes.findIndex((route) => route.name === routeName);
    if (routeIndex < 0) {
      return;
    }

    navigation.emit({
      type: "tabLongPress",
      target: state.routes[routeIndex].key,
    });
  };

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={MOBILE_BOTTOM_NAV_UI.NAV_ARIA}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 4) }]}
    >
      {TAB_ITEMS.map((item) => {
        const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
        const isFocused =
          item.routeName !== PLACE_PRODUCT_ROUTE &&
          routeIndex >= 0 &&
          state.index === routeIndex;
        const badge =
          item.routeName === "cart"
            ? cartBadge
            : item.routeName === "profile"
              ? profileBadge
              : null;
        const iconColor = isFocused ? theme.colors.action : theme.colors.textMuted;
        const placeProductAria = isAuthorized
          ? MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_ARIA
          : MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_LOGIN_ARIA;

        return (
          <Pressable
            key={item.routeName}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={
              item.routeName === PLACE_PRODUCT_ROUTE ? placeProductAria : item.accessibilityLabel
            }
            onPress={() => handlePress(item.routeName)}
            onLongPress={() => handleLongPress(item.routeName)}
            style={[styles.item, isFocused && styles.itemActive]}
          >
            <View style={styles.iconWrap}>
              <MaterialIcons name={item.icon} size={TAB_ICON_SIZE} color={iconColor} />
              {badge ? (
                <View
                  style={styles.badge}
                  accessibilityLabel={
                    item.routeName === "cart" && cartCount > 0
                      ? CART_PAGE_UI.TITLE
                      : undefined
                  }
                >
                  <AppText style={styles.badgeText}>{badge}</AppText>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
