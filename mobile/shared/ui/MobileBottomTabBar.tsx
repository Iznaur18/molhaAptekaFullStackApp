import {
  isDimColorScheme,
  izIconSizes,
  izIconStrokeNav,
} from "@izibuy/design-tokens";
/** Lucide RN ≥0.469: `Home` удалён → `House` (тот же глиф, что web `Home`). */
import Home from "lucide-react-native/icons/house";
import LayoutGrid from "lucide-react-native/icons/layout-grid";
import Plus from "lucide-react-native/icons/plus";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import User from "lucide-react-native/icons/user";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
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
import { PromoReturnStreakDock } from "@/features/promo-return-streak/ui/PromoReturnStreakDock";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CART_PAGE_UI, MOBILE_BOTTOM_NAV_UI } from "@/shared/config";
import { useCatalogCategoryView } from "@/shared/lib/catalogCategoryViewStore";
import { isHomeTabBarRoute } from "@/shared/lib/isHomeTabBarRoute";
import { isProfileTabBarRoute } from "@/shared/lib/isProfileTabBarRoute";
import {
  MOBILE_BOTTOM_NAV_BLUR_CSS_PX,
  MOBILE_BOTTOM_NAV_BLUR_INTENSITY_NATIVE,
  MOBILE_BOTTOM_NAV_BLUR_INTENSITY_WEB,
  MOBILE_BOTTOM_NAV_BORDER_RADIUS,
  MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT,
  MOBILE_BOTTOM_NAV_ITEM_RADIUS,
  MOBILE_BOTTOM_NAV_PADDING_HORIZONTAL,
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL,
  MOBILE_BOTTOM_NAV_PRIMARY_SIZE,
  resolveMobileBottomNavHorizontalInset,
  resolveMobileBottomNavLayoutHeight,
  resolveMobileBottomNavPaddingBottom,
} from "@/shared/lib/mobileBottomNavLayout";
import { useSoftKeyboardOpen } from "@/shared/lib/useSoftKeyboardOpen";
import { resolveContentMaxWidth } from "@/shared/lib/screenBreakpoints";
import { homeCatalogTabBarRevealProgress } from "@/shared/model/homeCatalogTabBarVisibility";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppText } from "@/shared/ui/AppText";

const TAB_ICON_SIZE = izIconSizes.xl;
const TAB_ICON_STROKE = izIconStrokeNav;
const PLACE_PRODUCT_ROUTE = "place-product";
const HOME_TAB_ROUTE = "index";
/** Паритет с web `gap: 0.1rem`. */
const NAV_ITEMS_GAP = 1.6;

type TabIcon = typeof Home;

const mixHex = (base: string, over: string, overWeight: number): string => {
  const channel = (hex: string) => {
    const raw = hex.replace("#", "");
    return [
      Number.parseInt(raw.slice(0, 2), 16),
      Number.parseInt(raw.slice(2, 4), 16),
      Number.parseInt(raw.slice(4, 6), 16),
    ];
  };
  const [baseR, baseG, baseB] = channel(base);
  const [overR, overG, overB] = channel(over);
  const mix = (from: number, to: number) =>
    Math.round(from * (1 - overWeight) + to * overWeight);
  const byte = (value: number) => value.toString(16).padStart(2, "0");
  return `#${byte(mix(baseR, overR))}${byte(mix(baseG, overG))}${byte(mix(baseB, overB))}`;
};
const INTRO_REPLAY_HOLD_MS = 1000;

const withAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

type TabItemConfig = {
  routeName: string;
  icon: TabIcon;
  label: string | null;
  accessibilityLabel: string;
};

const TAB_ITEMS: TabItemConfig[] = [
  {
    routeName: "index",
    icon: Home,
    label: MOBILE_BOTTOM_NAV_UI.TAB_HOME,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_HOME_ARIA,
  },
  {
    routeName: "catalog",
    icon: LayoutGrid,
    label: MOBILE_BOTTOM_NAV_UI.TAB_CATALOG,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_CATALOG_ARIA,
  },
  {
    routeName: PLACE_PRODUCT_ROUTE,
    icon: Plus,
    label: null,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_ARIA,
  },
  {
    routeName: "cart",
    icon: ShoppingCart,
    label: MOBILE_BOTTOM_NAV_UI.TAB_CART,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_CART_ARIA,
  },
  {
    routeName: "me",
    icon: User,
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
  /** Liquid-glass pill — паритет с web MobileBottomNav.css (`box-shadow: none`). */
  navPill: {
    overflow: "hidden",
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: mixHex(theme.colors.border, theme.colors.onContrast, 0.42),
    backgroundColor: withAlpha(theme.colors.surface, "8C"),
    shadowOpacity: 0,
    elevation: 0,
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
    gap: 2.4,
    minHeight: MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT,
    paddingVertical: 4,
    paddingHorizontal: 2.4,
    borderRadius: MOBILE_BOTTOM_NAV_ITEM_RADIUS,
    backgroundColor: "transparent",
  },
  itemActive: {
    backgroundColor: mixHex(theme.colors.actionSoft, theme.colors.onContrast, 0.42),
    shadowOpacity: 0,
    elevation: 0,
  },
  itemPrimary: {
    minHeight: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  primaryButton: {
    width: MOBILE_BOTTOM_NAV_PRIMARY_SIZE,
    height: MOBILE_BOTTOM_NAV_PRIMARY_SIZE,
    borderRadius: MOBILE_BOTTOM_NAV_PRIMARY_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    maxWidth: "100%",
    fontSize: 10.56,
    fontWeight: "600",
    lineHeight: 12,
  },
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4.8,
    right: -6.4,
    minWidth: 15,
    height: 15,
    borderRadius: 999,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.danger,
  },
  /** Web `.mobile-bottom-nav__badge` font 0.55rem / line-height 1 → 8.8. */
  badgeText: {
    fontSize: 8.8,
    fontWeight: "700",
    color: theme.colors.onContrast,
    lineHeight: 8.8,
  },
}));

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

export const MobileBottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
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
  /** Паритет web `:root.app-soft-keyboard-open .mobile-bottom-nav { visibility: hidden }`. */
  const isSoftKeyboardOpen = useSoftKeyboardOpen();

  const cartBadge = cartCount > 0 ? formatBadge(cartCount) : null;
  const profileBadge =
    isAuthorized && unreadNotifications > 0 ? formatBadge(unreadNotifications) : null;
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

    // Паритет web MobileBottomNav: гость → /login, не экран профиля.
    if (routeName === "me" && !isAuthorized) {
      router.push("/(auth)/login");
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

    if (event.defaultPrevented) {
      return;
    }

    // С hub/* (реклама и др.) navigate("index") часто не переключает таб —
    // явный путь главной (как CatalogBrowserPage → "/(tabs)").
    if (routeName === HOME_TAB_ROUTE && isProfileTabBarContext) {
      router.navigate("/(tabs)");
      return;
    }

    navigation.navigate(route.name);
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

  const homeRouteIndex = state.routes.findIndex(
    (route) => route.name === HOME_TAB_ROUTE,
  );
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
    } else if (item.routeName === "me") {
      isFocused = isRouteActive || isProfileTabBarContext;
    } else {
      isFocused = isRouteActive;
    }
    const badge =
      item.routeName === "cart"
        ? cartBadge
        : item.routeName === "me"
          ? profileBadge
          : null;
    const isPrimary = item.routeName === PLACE_PRODUCT_ROUTE;
    const iconColor = isPrimary
      ? theme.colors.onContrast
      : isFocused
        ? theme.colors.action
        : theme.colors.textSecondary;
    const Icon = item.icon;
    const placeProductAria = isAuthorized
      ? MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_ARIA
      : MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_LOGIN_ARIA;

    return (
      <Pressable
        key={item.routeName}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={isPrimary ? placeProductAria : item.accessibilityLabel}
        onPress={() => handlePress(item.routeName)}
        onLongPress={() => handleLongPress(item.routeName)}
        onPressIn={item.routeName === HOME_TAB_ROUTE ? startIntroHoldTimer : undefined}
        onPressOut={item.routeName === HOME_TAB_ROUTE ? clearIntroHoldTimer : undefined}
        style={[
          styles.item,
          isPrimary && styles.itemPrimary,
          isFocused && styles.itemActive,
        ]}
      >
        {isPrimary ? (
          <View style={styles.primaryButton}>
            <Icon
              size={TAB_ICON_SIZE}
              strokeWidth={TAB_ICON_STROKE}
              color={iconColor}
            />
          </View>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Icon
                size={TAB_ICON_SIZE}
                strokeWidth={TAB_ICON_STROKE}
                color={iconColor}
              />
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
            {item.label ? (
              <AppText style={[styles.label, { color: iconColor }]} numberOfLines={1}>
                {item.label}
              </AppText>
            ) : null}
          </>
        )}
      </Pressable>
    );
  });

  return (
    <>
      {isSoftKeyboardOpen ? null : <PromoReturnStreakDock />}
      {isSoftKeyboardOpen ? null : (
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
                intensity={
                  Platform.OS === "web"
                    ? MOBILE_BOTTOM_NAV_BLUR_INTENSITY_WEB
                    : MOBILE_BOTTOM_NAV_BLUR_INTENSITY_NATIVE
                }
                tint={isDimColorScheme(colorScheme) ? "dark" : "light"}
                style={[
                  styles.navBlur,
                  Platform.OS === "web"
                    ? ({
                        backdropFilter: `blur(${MOBILE_BOTTOM_NAV_BLUR_CSS_PX}px) saturate(1.35)`,
                      } as object)
                    : null,
                ]}
              >
                <View style={styles.liquidOverlay} pointerEvents="none" />
                <View style={styles.navRow}>{items}</View>
              </BlurView>
            </View>
          </Animated.View>
        </View>
      )}

      <SellerProductsLimitModal
        visible={placeProduct.limitModalVisible}
        onClose={placeProduct.closeLimitModal}
        isPremiumUser={placeProduct.isPremiumUser}
        limit={placeProduct.sellerProductsLimit}
        hasPersonalOverride={placeProduct.hasPersonalOverride}
      />
    </>
  );
};
