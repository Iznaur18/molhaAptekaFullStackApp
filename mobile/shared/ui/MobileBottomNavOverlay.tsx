/**
 * Bottom nav вне `(tabs)` — паритет web AppShell `MobileBottomNav` на `/user/:id`.
 * Та же pill-хромка, что `MobileBottomTabBar`, без tab-state.
 */
import {
  isDimColorScheme,
  izIconSizes,
  izIconStrokeNav,
} from "@izibuy/design-tokens";
import Home from "lucide-react-native/icons/house";
import LayoutGrid from "lucide-react-native/icons/layout-grid";
import Plus from "lucide-react-native/icons/plus";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import User from "lucide-react-native/icons/user";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartTotalCount } from "@/entities/cart/model/useCartTotalCount";
import { SellerProductsLimitModal } from "@/entities/product/ui/SellerProductsLimitModal";
import { useUnreadNotificationsCount } from "@/entities/notification/model/useInAppNotifications";
import { usePlaceProductPress } from "@/features/place-product/model/usePlaceProductPress";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CART_PAGE_UI, MOBILE_BOTTOM_NAV_UI } from "@/shared/config";
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
  resolveMobileBottomNavPaddingBottom,
} from "@/shared/lib/mobileBottomNavLayout";
import { useSoftKeyboardOpen } from "@/shared/lib/useSoftKeyboardOpen";
import { resolveContentMaxWidth } from "@/shared/lib/screenBreakpoints";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppText } from "@/shared/ui/AppText";

const TAB_ICON_SIZE = izIconSizes.xl;
const TAB_ICON_STROKE = izIconStrokeNav;
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

const withAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

type OverlayTab = {
  routeName: "index" | "catalog" | "place-product" | "cart" | "me";
  href: "/(tabs)" | "/(tabs)/catalog" | "/(tabs)/cart" | "/(tabs)/me" | null;
  icon: TabIcon;
  label: string | null;
  accessibilityLabel: string;
};

const OVERLAY_TABS: OverlayTab[] = [
  {
    routeName: "index",
    href: "/(tabs)",
    icon: Home,
    label: MOBILE_BOTTOM_NAV_UI.TAB_HOME,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_HOME_ARIA,
  },
  {
    routeName: "catalog",
    href: "/(tabs)/catalog",
    icon: LayoutGrid,
    label: MOBILE_BOTTOM_NAV_UI.TAB_CATALOG,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_CATALOG_ARIA,
  },
  {
    routeName: "place-product",
    href: null,
    icon: Plus,
    label: null,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_ARIA,
  },
  {
    routeName: "cart",
    href: "/(tabs)/cart",
    icon: ShoppingCart,
    label: MOBILE_BOTTOM_NAV_UI.TAB_CART,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_CART_ARIA,
  },
  {
    routeName: "me",
    href: "/(tabs)/me",
    icon: User,
    label: MOBILE_BOTTOM_NAV_UI.TAB_PROFILE,
    accessibilityLabel: MOBILE_BOTTOM_NAV_UI.TAB_PROFILE_ARIA,
  },
];

const useStyles = createThemedStyles((theme) => ({
  shell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
    zIndex: 40,
  },
  pillWrap: {
    width: "100%",
    alignSelf: "center",
    pointerEvents: "box-none",
  },
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
    fontWeight: theme.typography.fontWeightSemibold,
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
  badgeText: {
    fontSize: 8.8,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.onContrast,
    lineHeight: 8.8,
  },
}));

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

/** Паритет web: на `/user/:id` нижний нав виден, вкладки неактивны. */
export const MobileBottomNavOverlay = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useStyles();
  const { theme, colorScheme } = useAppThemeSettings();
  const sessionQuery = useAuthSessionQuery();
  const cartCount = useCartTotalCount();
  const unreadNotifications = useUnreadNotificationsCount();
  const isAuthorized = sessionQuery.data?.user != null;
  const isSoftKeyboardOpen = useSoftKeyboardOpen();
  const placeProduct = usePlaceProductPress();

  const contentMaxWidth = useMemo(
    () => resolveContentMaxWidth(windowWidth),
    [windowWidth],
  );
  const horizontalInset = resolveMobileBottomNavHorizontalInset(insets);

  const cartBadge = cartCount > 0 ? formatBadge(cartCount) : null;
  const profileBadge =
    isAuthorized && unreadNotifications > 0 ? formatBadge(unreadNotifications) : null;

  const handlePress = (tab: OverlayTab) => {
    if (tab.routeName === "place-product") {
      placeProduct.handlePlaceProductPress();
      return;
    }
    if (tab.routeName === "me" && !isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    if (tab.href) {
      router.navigate(tab.href);
    }
  };

  if (isSoftKeyboardOpen) {
    return (
      <SellerProductsLimitModal
        visible={placeProduct.limitModalVisible}
        onClose={placeProduct.closeLimitModal}
        isPremiumUser={placeProduct.isPremiumUser}
        limit={placeProduct.sellerProductsLimit}
        hasPersonalOverride={placeProduct.hasPersonalOverride}
      />
    );
  }

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
        <View
          pointerEvents="box-none"
          style={[
            styles.pillWrap,
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
              <View style={styles.navRow}>
                {OVERLAY_TABS.map((tab) => {
                  const isPrimary = tab.routeName === "place-product";
                  const badge =
                    tab.routeName === "cart"
                      ? cartBadge
                      : tab.routeName === "me"
                        ? profileBadge
                        : null;
                  const iconColor = isPrimary
                    ? theme.colors.onContrast
                    : theme.colors.textSecondary;
                  const Icon = tab.icon;
                  const placeProductAria = isAuthorized
                    ? MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_ARIA
                    : MOBILE_BOTTOM_NAV_UI.TAB_PLACE_PRODUCT_LOGIN_ARIA;

                  return (
                    <Pressable
                      key={tab.routeName}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: false }}
                      accessibilityLabel={
                        isPrimary ? placeProductAria : tab.accessibilityLabel
                      }
                      onPress={() => handlePress(tab)}
                      style={[styles.item, isPrimary && styles.itemPrimary]}
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
                                  tab.routeName === "cart" && cartCount > 0
                                    ? CART_PAGE_UI.TITLE
                                    : undefined
                                }
                              >
                                <AppText style={styles.badgeText}>{badge}</AppText>
                              </View>
                            ) : null}
                          </View>
                          {tab.label ? (
                            <AppText
                              style={[styles.label, { color: iconColor }]}
                              numberOfLines={1}
                            >
                              {tab.label}
                            </AppText>
                          ) : null}
                        </>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </BlurView>
          </View>
        </View>
      </View>

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
