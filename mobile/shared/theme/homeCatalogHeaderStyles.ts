import { Platform, StyleSheet, type ViewStyle } from "react-native";

import {
  HOME_CATALOG_HEADER_BOTTOM_MARGIN,
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH,
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
  HOME_CATALOG_HEADER_SEARCH_ICON_LEFT,
  HOME_CATALOG_HEADER_PANEL_BORDER_COLOR,
  HOME_CATALOG_HEADER_PANEL_INSET_LINE_COLOR,
  HOME_CATALOG_HEADER_PANEL_PADDING,
  HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING,
  HOME_CATALOG_HEADER_PANEL_RADIUS,
  HOME_CATALOG_HEADER_PANEL_SHADOW,
  HOME_CATALOG_HEADER_SEARCH_INPUT_BORDER_RADIUS,
  HOME_CATALOG_HEADER_SEARCH_INPUT_FONT_SIZE,
  HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT,
  HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_LEFT,
  HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_RIGHT,
  HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_VERTICAL,
  HOME_CATALOG_HEADER_TOP_ROW_GAP,
  HOME_CATALOG_HEADER_USERS_PILL_GAP,
  HOME_CATALOG_HEADER_USERS_STRETCH_BOTTOM_PADDING,
  HOME_CATALOG_HEADER_USERS_STRETCH_ITEM_GAP,
  HOME_CATALOG_HEADER_USERS_STRETCH_TOGGLE_GAP,
} from "@/shared/lib/homeCatalogHeaderLayout";
import { MOBILE_BOTTOM_NAV_BORDER_RADIUS } from "@/shared/lib/mobileBottomNavLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const panelShadowStyle =
  Platform.OS === "ios"
    ? {
        shadowColor: HOME_CATALOG_HEADER_PANEL_SHADOW.color,
        shadowOffset: { width: 0, height: HOME_CATALOG_HEADER_PANEL_SHADOW.offsetY },
        shadowOpacity: 1,
        shadowRadius: HOME_CATALOG_HEADER_PANEL_SHADOW.radius,
      }
    : { elevation: 6 };

export const useHomeCatalogHeaderStyles = createThemedStyles((theme) => ({
  panel: {
    position: "relative",
    overflow: "hidden",
    marginBottom: HOME_CATALOG_HEADER_BOTTOM_MARGIN,
    paddingHorizontal: HOME_CATALOG_HEADER_PANEL_PADDING.horizontal,
    paddingBottom: HOME_CATALOG_HEADER_PANEL_PADDING.bottom,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CATALOG_HEADER_PANEL_BORDER_COLOR,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: HOME_CATALOG_HEADER_PANEL_RADIUS,
    borderBottomRightRadius: HOME_CATALOG_HEADER_PANEL_RADIUS,
    backgroundColor: "transparent",
    ...panelShadowStyle,
  },
  /**
   * Web v2 `.app-shell__header-panel`: отдельный стиль (не мержить с Ozon-panel),
   * иначе на RN web longhand radius 0/18 перебивает pill.
   */
  panelFloating: {
    position: "relative",
    width: "100%",
    marginBottom: HOME_CATALOG_HEADER_BOTTOM_MARGIN,
    paddingHorizontal: HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING.horizontal,
    paddingBottom: HOME_CATALOG_HEADER_PANEL_FLOATING_PADDING.bottom,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.1)",
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    borderTopLeftRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    borderTopRightRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    borderBottomLeftRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    borderBottomRightRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    /** Клип glass по бокам; stretch-меню в Modal — не режется. */
    overflow: "hidden",
    backgroundColor: "transparent",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "none", outlineStyle: "none" } as ViewStyle)
      : null),
  },
  /** Glass fill под pill — дублируем radius (RN web absoluteFill иначе квадрат). */
  panelFloatingGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: MOBILE_BOTTOM_NAV_BORDER_RADIUS,
    overflow: "hidden",
  },
  panelFlatSheet: {
    overflow: "visible",
    borderWidth: 0,
    borderColor: "transparent",
    marginBottom: 0,
    backgroundColor: "transparent",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  panelInsetLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: HOME_CATALOG_HEADER_PANEL_INSET_LINE_COLOR,
    zIndex: 2,
  },
  panelContent: {
    position: "relative",
    zIndex: 3,
    overflow: "visible",
  },
  accentSlot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    overflow: "hidden",
    zIndex: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: HOME_CATALOG_HEADER_TOP_ROW_GAP,
    overflow: "visible",
  },
  /** Web `.app-shell__auth-actions--mobile-top` gap `0.3rem`. */
  authActions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: HOME_CATALOG_HEADER_USERS_PILL_GAP,
    overflow: "visible",
  },
  bannerBelowPanel: {
    marginTop: 0,
    marginBottom: 0,
  },
  bannerListHeaderFullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  searchWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: HOME_CATALOG_HEADER_SEARCH_ICON_LEFT,
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    minHeight: HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT,
    borderWidth: 0,
    borderRadius: HOME_CATALOG_HEADER_SEARCH_INPUT_BORDER_RADIUS,
    paddingLeft: HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_LEFT,
    paddingRight: HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_RIGHT,
    paddingVertical: HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_VERTICAL,
    fontSize: HOME_CATALOG_HEADER_SEARCH_INPUT_FONT_SIZE,
    lineHeight: 20,
    color: theme.colors.text,
    /* Web v2: color-mix(text 7%, transparent) */
    backgroundColor: `${theme.colors.text}12`,
  },
  usersNavPill: {
    position: "relative",
    zIndex: 2,
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    flexShrink: 0,
  },
  usersNavPillPlaceholder: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
  },
  usersMenuPortalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  usersStretchShell: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    borderWidth: HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH,
    borderRadius: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  usersStretchShellPortal: {
    position: "absolute",
    zIndex: 10,
  },
  usersStretchToggle: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  usersStretchIconCircle: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    borderRadius: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE / 2,
    borderWidth: HOME_CATALOG_HEADER_CIRCLE_BUTTON_BORDER_WIDTH,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  usersStretchItems: {
    width: "100%",
    alignItems: "center",
    marginTop: HOME_CATALOG_HEADER_USERS_STRETCH_TOGGLE_GAP,
    gap: HOME_CATALOG_HEADER_USERS_STRETCH_ITEM_GAP,
    paddingBottom: HOME_CATALOG_HEADER_USERS_STRETCH_BOTTOM_PADDING,
  },
  usersStretchItem: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  usersStretchItemActive: {
    opacity: 1,
  },
}));
