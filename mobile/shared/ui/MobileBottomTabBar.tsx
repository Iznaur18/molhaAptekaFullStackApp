import Feather from "@expo/vector-icons/Feather";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { SellerProductsLimitModal } from "@/entities/product/ui/SellerProductsLimitModal";
import { useUnreadNotificationsCount } from "@/entities/notification/model/useInAppNotifications";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { IS_HOME_FEED_INTRO_BACKDROP_ENABLED } from "@/features/home-feed/model/isHomeFeedIntroBackdropEnabled";
import { usePlaceProductPress } from "@/features/place-product/model/usePlaceProductPress";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CART_PAGE_UI, MOBILE_BOTTOM_NAV_UI } from "@/shared/config";
import { useCatalogCategoryView } from "@/shared/lib/catalogCategoryViewStore";
import { isHomeTabBarRoute } from "@/shared/lib/isHomeTabBarRoute";
import { isProfileTabBarRoute } from "@/shared/lib/isProfileTabBarRoute";
import {
  MOBILE_BOTTOM_NAV_BORDER_RADIUS,
  MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT,
  MOBILE_BOTTOM_NAV_PADDING_HORIZONTAL,
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL,
  resolveMobileBottomNavHorizontalInset,
  resolveMobileBottomNavLayoutHeight,
  resolveMobileBottomNavPaddingBottom,
} from "@/shared/lib/mobileBottomNavLayout";
import { resolveContentMaxWidth } from "@/shared/lib/screenBreakpoints";
import { homeCatalogTabBarRevealProgress } from "@/shared/model/homeCatalogTabBarVisibility";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppText } from "@/shared/ui/AppText";

const TAB_ICON_SIZE = 24;
const PLACE_PRODUCT_ROUTE = "place-product";
const HOME_TAB_ROUTE = "index";
const NAV_ITEMS_GAP = 2;
const INTRO_REPLAY_HOLD_MS = 1000;

const withAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

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
  /** Absolute overlay: не резервирует высоту сцены — карточки до края экрана. */
  shell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  pillWrap: {
    width: "100%",
    alignSelf: "center",
    pointerEvents: "box-none",
  },
  /** Liquid-glass pill — паритет с web MobileBottomNav.css */
  navPill: {
    overflow: "hidden",
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: withAlpha(theme.colors.onContrast, "6B"),
    backgroundColor: withAlpha(theme.colors.surface, "8C"),
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  navBlur: {
    overflow: "hidden",
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    paddingVertical: MOBILE_BOTTOM_NAV_PADDING_VERTICAL,
    paddingHorizontal: MOBILE_BOTTOM_NAV_PADDING_HORIZONTAL,
  },
  liquidOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(theme.colors.onContrast, "24"),
  },
  liquidSheen: {
    position: "absolute",
    top: 1,
    left: "12%",
    right: "12%",
    height: "42%",
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    backgroundColor: withAlpha(theme.colors.onContrast, "3D"),
    opacity: 0.55,
  },
  navRow: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: NAV_ITEMS_GAP,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    backgroundColor: "transparent",
  },
  itemActive: {
    backgroundColor: withAlpha(theme.colors.onContrast, "6B"),
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
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
  badgeText: {
    fontSize: 8.8,
    fontWeight: "700",
    color: theme.colors.onContrast,
    lineHeight: 11,
  },
}));

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

export const MobileBottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useTabBarStyles();
  const { theme, colorScheme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const cartCount = useCartTotalCount();
  const unreadNotifications = useUnreadNotificationsCount();
  const isAuthorized = sessionQuery.data?.user != null;
  const isProfileTabBarContext = isProfileTabBarRoute(pathname);
  const isHomeTabBarContext = isHomeTabBarRoute(pathname);
  const isCatalogCategoryView = useCatalogCategoryView();

  const cartBadge = cartCount > 0 ? formatBadge(cartCount) : null;
  const profileBadge =
    unreadNotifications > 0 ? formatBadge(unreadNotifications) : null;
  const placeProduct = usePlaceProductPress();
  const { replayIntro } = useAppIntro();
  const introHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentMaxWidth = useMemo(
    () => resolveContentMaxWidth(windowWidth),
    [windowWidth],
  );
  const horizontalInset = resolveMobileBottomNavHorizontalInset(insets);
  const tabBarLayoutHeight = resolveMobileBottomNavLayoutHeight(insets.bottom);

  const clearIntroHoldTimer = useCallback(() => {
    if (introHoldTimerRef.current != null) {
      clearTimeout(introHoldTimerRef.current);
      introHoldTimerRef.current = null;
    }
  }, []);

  const startIntroHoldTimer = useCallback(() => {
    if (!IS_HOME_FEED_INTRO_BACKDROP_ENABLED) {
      return;
    }
    clearIntroHoldTimer();
    introHoldTimerRef.current = setTimeout(() => {
      introHoldTimerRef.current = null;
      replayIntro();
    }, INTRO_REPLAY_HOLD_MS);
  }, [clearIntroHoldTimer, replayIntro]);

  useEffect(() => clearIntroHoldTimer, [clearIntroHoldTimer]);

  const animatedShellStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: (1 - homeCatalogTabBarRevealProgress.value) * tabBarLayoutHeight,
        },
      ],
    }),
    [tabBarLayoutHeight],
  );

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

  const homeRouteIndex = state.routes.findIndex((route) => route.name === HOME_TAB_ROUTE);
  const isHomeTabActive =
    (homeRouteIndex >= 0 && state.index === homeRouteIndex) || isHomeTabBarContext;
  const isCategoryOnHomeTab = isCatalogCategoryView && isHomeTabActive;

  const items = TAB_ITEMS.map((item) => {
    const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
    const isRouteActive = routeIndex >= 0 && state.index === routeIndex;
    let isFocused: boolean;
    if (item.routeName === PLACE_PRODUCT_ROUTE) {
      isFocused = false;
    } else if (item.routeName === HOME_TAB_ROUTE) {
      isFocused = isHomeTabActive && !isCategoryOnHomeTab;
    } else if (item.routeName === "catalog") {
      isFocused = isRouteActive || isCategoryOnHomeTab;
    } else if (item.routeName === "profile") {
      isFocused = isRouteActive || isProfileTabBarContext;
    } else {
      isFocused = isRouteActive;
    }
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
            paddingHorizontal: horizontalInset,
            paddingBottom: resolveMobileBottomNavPaddingBottom(insets.bottom),
          },
        ]}
      >
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.pillWrap,
            animatedShellStyle,
            contentMaxWidth != null ? { maxWidth: contentMaxWidth } : null,
          ]}
        >
          <View style={styles.navPill}>
            <BlurView
              intensity={Platform.OS === "web" ? 0 : 72}
              tint={colorScheme === "dark" ? "dark" : "light"}
              style={styles.navBlur}
            >
              <View style={styles.liquidOverlay} pointerEvents="none" />
              <View style={styles.liquidSheen} pointerEvents="none" />
              <View style={styles.navRow}>{items}</View>
            </BlurView>
          </View>
        </Animated.View>
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
