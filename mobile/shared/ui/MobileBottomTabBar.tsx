import Feather from "@expo/vector-icons/Feather";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { SellerProductsLimitModal } from "@/entities/product/ui/SellerProductsLimitModal";
import { useUnreadNotificationsCount } from "@/entities/notification/model/useInAppNotifications";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { usePlaceProductPress } from "@/features/place-product/model/usePlaceProductPress";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CART_PAGE_UI, MOBILE_BOTTOM_NAV_UI } from "@/shared/config";
import { isHomeTabBarRoute } from "@/shared/lib/isHomeTabBarRoute";
import { isProfileTabBarRoute } from "@/shared/lib/isProfileTabBarRoute";
import {
  MOBILE_BOTTOM_NAV_FLOAT_OFFSET,
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL,
  resolveMobileBottomNavHorizontalInset,
} from "@/shared/lib/mobileBottomNavLayout";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppText } from "@/shared/ui/AppText";

const TAB_ICON_SIZE = 24;
const PLACE_PRODUCT_ROUTE = "place-product";
const HOME_TAB_ROUTE = "index";

/** Удержание кнопки «Домой» дольше этого времени запускает повтор интро-ролика. */
const INTRO_REPLAY_HOLD_MS = 1000;

/** Ozon-стиль: плоский бар, табы вплотную. */
const NAV_ITEMS_GAP = 0;
/** Горизонтальный паддинг плоского бара. */
const NAV_PADDING_HORIZONTAL = 8;

type TabItemConfig = {
  routeName: string;
  icon: keyof typeof Feather.glyphMap;
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
    icon: "plus",
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
    icon: "user",
    label: MOBILE_BOTTOM_NAV_UI.TAB_PROFILE,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_PROFILE_ARIA,
  },
];

const useTabBarStyles = createThemedStyles((theme) => ({
  shell: {
    paddingTop: MOBILE_BOTTOM_NAV_FLOAT_OFFSET,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  /** Ozon-стиль: плоский бар во всю ширину, отделён тонкой линией сверху. */
  navShadow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(17, 24, 39, 0.08)",
  },
  navBlur: {
    overflow: "hidden",
    paddingVertical: MOBILE_BOTTOM_NAV_PADDING_VERTICAL,
    paddingHorizontal: NAV_PADDING_HORIZONTAL,
  },
  /** Почти непрозрачный белый слой поверх blur — Ozon-стиль. */
  navOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: NAV_ITEMS_GAP,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  /** Ozon-стиль: активный таб показывает только цвет иконки, без подложки. */
  itemActive: {
    backgroundColor: "transparent",
  },
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  /** 0.95rem = 15.2px — паритет с web */
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 999,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.danger,
  },
  /** 0.55rem = 8.8px — паритет с web */
  badgeText: {
    fontSize: 8.8,
    fontWeight: "700",
    color: theme.colors.onContrast,
    lineHeight: 11,
  },
}));

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

export const MobileBottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const styles = useTabBarStyles();
  const { theme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const cartCount = useCartTotalCount();
  const unreadNotifications = useUnreadNotificationsCount();
  const isAuthorized = sessionQuery.data?.user != null;
  const isProfileTabBarContext = isProfileTabBarRoute(pathname);
  const isHomeTabBarContext = isHomeTabBarRoute(pathname);

  const cartBadge = cartCount > 0 ? formatBadge(cartCount) : null;
  const profileBadge =
    unreadNotifications > 0 ? formatBadge(unreadNotifications) : null;
  const placeProduct = usePlaceProductPress();
  const { replayIntro } = useAppIntro();
  const introHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIntroHoldTimer = useCallback(() => {
    if (introHoldTimerRef.current != null) {
      clearTimeout(introHoldTimerRef.current);
      introHoldTimerRef.current = null;
    }
  }, []);

  const startIntroHoldTimer = useCallback(() => {
    clearIntroHoldTimer();
    introHoldTimerRef.current = setTimeout(() => {
      introHoldTimerRef.current = null;
      replayIntro();
    }, INTRO_REPLAY_HOLD_MS);
  }, [clearIntroHoldTimer, replayIntro]);

  useEffect(() => clearIntroHoldTimer, [clearIntroHoldTimer]);

  const handlePress = (routeName: string) => {
    if (routeName === PLACE_PRODUCT_ROUTE) {
      placeProduct.handlePlaceProductPress();
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

  const items = TAB_ITEMS.map((item) => {
    const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
    const isFocused =
      item.routeName !== PLACE_PRODUCT_ROUTE &&
      routeIndex >= 0 &&
      (state.index === routeIndex ||
        (item.routeName === "profile" && isProfileTabBarContext) ||
        (item.routeName === "index" && isHomeTabBarContext));
    const badge =
      item.routeName === "cart"
        ? cartBadge
        : item.routeName === "profile"
          ? profileBadge
          : null;
    const iconColor = isFocused ? theme.colors.action : theme.colors.textSecondary;
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
        onPressIn={item.routeName === HOME_TAB_ROUTE ? startIntroHoldTimer : undefined}
        onPressOut={item.routeName === HOME_TAB_ROUTE ? clearIntroHoldTimer : undefined}
        style={[styles.item, isFocused && styles.itemActive]}
      >
        <View style={styles.iconWrap}>
          <Feather name={item.icon} size={TAB_ICON_SIZE} color={iconColor} />
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
  });

  return (
    <>
      <View
        accessibilityRole="tablist"
        accessibilityLabel={MOBILE_BOTTOM_NAV_UI.NAV_ARIA}
        pointerEvents="box-none"
        style={[
          styles.shell,
          {
            paddingHorizontal: resolveMobileBottomNavHorizontalInset(insets),
          },
        ]}
      >
        <View style={styles.navShadow}>
          <BlurView
            intensity={Platform.OS === "web" ? 0 : 85}
            tint="light"
            style={[
              styles.navBlur,
              // белый бар закрывает нижнюю safe-area целиком (Ozon-стиль)
              {
                paddingBottom:
                  MOBILE_BOTTOM_NAV_PADDING_VERTICAL + Math.max(insets.bottom, 4),
              },
            ]}
          >
            <View style={styles.navOverlay} />
            <View style={styles.navRow}>{items}</View>
          </BlurView>
        </View>
      </View>

      <SellerProductsLimitModal
        visible={placeProduct.limitModalVisible}
        onClose={placeProduct.closeLimitModal}
        isPremiumUser={placeProduct.isPremiumUser}
        limit={placeProduct.sellerProductsLimit}
      />
    </>
  );
};
