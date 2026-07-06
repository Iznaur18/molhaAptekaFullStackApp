import { Platform } from "react-native";

import {
  HOME_CATALOG_HEADER_BOTTOM_MARGIN,
  HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
  HOME_CATALOG_HEADER_SEARCH_ICON_LEFT,
  HOME_CATALOG_HEADER_PANEL_BORDER_COLOR,
  HOME_CATALOG_HEADER_PANEL_INSET_LINE_COLOR,
  HOME_CATALOG_HEADER_PANEL_PADDING,
  HOME_CATALOG_HEADER_PANEL_RADIUS,
  HOME_CATALOG_HEADER_PANEL_SHADOW,
  HOME_CATALOG_HEADER_SEARCH_INPUT_BORDER_RADIUS,
  HOME_CATALOG_HEADER_SEARCH_INPUT_FONT_SIZE,
  HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT,
  HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_LEFT,
  HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_RIGHT,
  HOME_CATALOG_HEADER_SEARCH_INPUT_PADDING_VERTICAL,
  HOME_CATALOG_HEADER_BANNER_BELOW_PANEL_MARGIN,
  HOME_CATALOG_HEADER_TOP_ROW_GAP,
  HOME_CATALOG_HEADER_USERS_PILL_GAP,
  HOME_CATALOG_HEADER_USERS_PILL_PADDING,
} from "@/shared/lib/homeCatalogHeaderLayout";
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
    borderWidth: 1,
    borderColor: HOME_CATALOG_HEADER_PANEL_BORDER_COLOR,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: HOME_CATALOG_HEADER_PANEL_RADIUS,
    borderBottomRightRadius: HOME_CATALOG_HEADER_PANEL_RADIUS,
    backgroundColor: "transparent",
    ...panelShadowStyle,
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
  },
  bannerBelowPanel: {
    marginTop: HOME_CATALOG_HEADER_BANNER_BELOW_PANEL_MARGIN,
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
    // iOS search bar fill: тонированный текст ~8%, адаптируется к теме.
    backgroundColor: `${theme.colors.text}14`,
  },
  usersNavPill: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
    gap: HOME_CATALOG_HEADER_USERS_PILL_GAP,
    padding: HOME_CATALOG_HEADER_USERS_PILL_PADDING,
    borderRadius: theme.radius.pill,
    backgroundColor: "transparent",
  },
  usersButton: {
    width: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    height: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE,
    borderRadius: HOME_CATALOG_HEADER_CIRCLE_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    // Ozon-стиль: плоская иконка без подложки.
    backgroundColor: "transparent",
  },
}));
