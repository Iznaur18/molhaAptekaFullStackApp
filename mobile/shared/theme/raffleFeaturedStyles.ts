import { Platform, StyleSheet } from "react-native";

import {
  RAFFLE_FEATURED_BANNER_CHROME as L,
  RAFFLE_FEATURED_CARD_BORDER_RADIUS,
} from "@izibuy/shared-lib";

import { HOME_FEED_SECTION_GAP } from "@/features/home-feed/lib/homeFeedSectionLayout";
import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const RAFFLE_FEATURED_BANNER_BORDER_RADIUS = RAFFLE_FEATURED_CARD_BORDER_RADIUS;
const SOUND_BUTTON_INSET = 10;
const SOUND_BUTTON_SIZE = 32;
const VISUAL_CONTROL_SIZE = 28;
const VISUAL_CONTROL_BORDER_RADIUS = 8;
const VISUAL_CONTROL_GAP = 4;
const VISUAL_ACTION_BUTTON_SIZE_SCALE = 0.75;
const VISUAL_ACTION_BUTTON_SIZE = VISUAL_CONTROL_SIZE * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const VISUAL_ACTION_BUTTON_BORDER_RADIUS =
  VISUAL_CONTROL_BORDER_RADIUS * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const VISUAL_ACTION_BUTTON_BACKGROUND_OPACITY = 0.72;
const VISUAL_ACTION_BUTTON_SHADOW_OPACITY = 0.14;
const VISUAL_ACTION_BUTTON_SHADOW_RADIUS = 2;
const VISUAL_ACTION_BUTTON_ELEVATION = 1;
const INFO_TOGGLE_FONT_SIZE = 15 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const INFO_TOGGLE_LINE_HEIGHT = 16 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const MANAGE_TOGGLE_FONT_SIZE = 18 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const MANAGE_TOGGLE_LINE_HEIGHT = 18 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const BADGE_MAX_WIDTH_PERCENT = "70%";
const BADGE_PADDING_HORIZONTAL = 8 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const BADGE_BORDER_RADIUS = 999;
const BADGE_FONT_SIZE = 12 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const BADGE_LINE_HEIGHT = 14 * VISUAL_ACTION_BUTTON_SIZE_SCALE;
const BANNER_BOTTOM_MARGIN = HOME_FEED_SECTION_GAP;
const MENU_GAP_INLINE = 4;

/** @deprecated Секция без внешней обёртки — оставлено для совместимости импортов. */
export const RAFFLE_SECTION_CARD_BORDER_RADIUS = 36;

export const RAFFLE_REVEAL_BUTTON_BORDER_RADIUS = 16;

export const useRaffleFeaturedBannerStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "100%",
    marginBottom: BANNER_BOTTOM_MARGIN,
  },
  rootInCarousel: {
    marginBottom: 0,
  },
  cardStack: {
    width: "100%",
    gap: L.cardPanelGap,
  },
  visualCard: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  visualCardCompleted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  visual: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  mediaFrame: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  /** Паритет web `filter: blur(28px)` + `scale(1.16)`. */
  mediaBlurBg: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.16 }],
  },
  mediaBlurBgWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  mediaBlurBgVideo: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.16 }],
    ...(Platform.OS === "web"
      ? ({
          filter: "blur(28px) saturate(1.05)",
        } as object)
      : null),
  },
  mediaBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaFg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  videoWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: P.black,
  },
  soundButton: {
    position: "absolute",
    right: SOUND_BUTTON_INSET,
    bottom: SOUND_BUTTON_INSET,
    zIndex: 5,
    width: SOUND_BUTTON_SIZE,
    height: SOUND_BUTTON_SIZE,
    borderRadius: SOUND_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 17, 0.55)",
  },
  /** Поверх swipe-overlay на RaffleProductsPage (паритет web z-index). */
  soundButtonOverlay: {
    zIndex: 10,
    elevation: 10,
  },
  visualTopBar: {
    position: "absolute",
    top: L.visualControlInset,
    left: L.visualControlInset,
    right: L.visualControlInset,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: VISUAL_CONTROL_GAP,
  },
  badge: {
    maxWidth: BADGE_MAX_WIDTH_PERCENT,
    minHeight: VISUAL_ACTION_BUTTON_SIZE,
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: 0,
    borderRadius: BADGE_BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `rgba(255, 255, 255, ${VISUAL_ACTION_BUTTON_BACKGROUND_OPACITY})`,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: VISUAL_ACTION_BUTTON_SHADOW_OPACITY,
    shadowRadius: VISUAL_ACTION_BUTTON_SHADOW_RADIUS,
    elevation: VISUAL_ACTION_BUTTON_ELEVATION,
  },
  badgeLabel: {
    color: theme.colors.ink,
    fontSize: BADGE_FONT_SIZE,
    fontWeight: "700",
    lineHeight: BADGE_LINE_HEIGHT,
  },
  visualTopControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: VISUAL_CONTROL_GAP,
    flexShrink: 0,
    marginLeft: "auto",
  },
  infoToggleButton: {
    width: VISUAL_ACTION_BUTTON_SIZE,
    height: VISUAL_ACTION_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderWidth: 0,
    borderRadius: VISUAL_ACTION_BUTTON_BORDER_RADIUS,
    backgroundColor: `rgba(255, 255, 255, ${VISUAL_ACTION_BUTTON_BACKGROUND_OPACITY})`,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: VISUAL_ACTION_BUTTON_SHADOW_OPACITY,
    shadowRadius: VISUAL_ACTION_BUTTON_SHADOW_RADIUS,
    elevation: VISUAL_ACTION_BUTTON_ELEVATION,
  },
  infoToggleText: {
    color: theme.colors.ink,
    fontSize: INFO_TOGGLE_FONT_SIZE,
    fontWeight: "800",
    lineHeight: INFO_TOGGLE_LINE_HEIGHT,
    opacity: 0.88,
  },
  infoPanel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    opacity: 0,
  },
  infoPanelOpen: {
    opacity: 1,
  },
  infoPanelScroll: {
    flex: 1,
  },
  infoPanelContent: {
    flexGrow: 1,
    gap: 8,
    paddingTop: 42,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  infoTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: P.onContrast,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: P.onContrast,
  },
  footerCard: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  footerCardCompleted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  footerContent: {
    gap: L.footerContentGap,
    paddingHorizontal: L.footerPaddingHorizontal,
    paddingBottom: L.footerPaddingBottom,
    paddingTop: L.footerPaddingTop,
  },
  progressBar: {
    width: "100%",
    height: L.progressBarHeight,
    borderRadius: L.progressBarBorderRadius,
    backgroundColor: theme.colors.actionBorder,
    overflow: "hidden",
  },
  progressBarCompleted: {
    backgroundColor: theme.colors.successSurface,
  },
  progressFill: {
    height: "100%",
    borderRadius: L.progressBarBorderRadius,
    backgroundColor: theme.colors.action,
  },
  progressFillCompleted: {
    backgroundColor: theme.colors.success,
  },
  progressLabel: {
    fontSize: 13.6,
    lineHeight: L.progressLabelLineHeight,
    fontWeight: "600",
    color: theme.colors.text,
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: L.actionsGap,
  },
  btnPrimary: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: theme.colors.action,
  },
  btnPrimaryCompleted: {
    backgroundColor: theme.colors.action,
  },
  btnPrimaryText: {
    fontSize: 13.2,
    fontWeight: "600",
    color: P.onContrast,
  },
  btnPrimaryTextCompleted: {
    color: P.onContrast,
  },
  btnInstagram: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: P.accentPink,
    backgroundColor: P.accentPinkSoft,
  },
  btnInstagramText: {
    fontSize: 13.2,
    fontWeight: "600",
    color: P.accentPinkDeep,
  },
  completedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: P.successDeep,
  },
}));

export const useRaffleManageActionsStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    minHeight: 32,
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.65,
  },
  btnEdit: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  btnDelete: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.danger,
  },
  btnPause: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  btnEditText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  btnDeleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  btnPauseText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
}));

export const useRaffleFeaturedBannerManageMenuStyles = createThemedStyles((theme) => ({
  toggle: {
    width: VISUAL_ACTION_BUTTON_SIZE,
    height: VISUAL_ACTION_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderWidth: 0,
    borderRadius: VISUAL_ACTION_BUTTON_BORDER_RADIUS,
    backgroundColor: `rgba(255, 255, 255, ${VISUAL_ACTION_BUTTON_BACKGROUND_OPACITY})`,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: VISUAL_ACTION_BUTTON_SHADOW_OPACITY,
    shadowRadius: VISUAL_ACTION_BUTTON_SHADOW_RADIUS,
    elevation: VISUAL_ACTION_BUTTON_ELEVATION,
  },
  toggleOpen: {
    backgroundColor: `rgba(124, 58, 237, ${VISUAL_ACTION_BUTTON_BACKGROUND_OPACITY})`,
  },
  toggleDisabled: {
    opacity: 0.55,
  },
  toggleText: {
    color: theme.colors.ink,
    fontSize: MANAGE_TOGGLE_FONT_SIZE,
    fontWeight: "800",
    lineHeight: MANAGE_TOGGLE_LINE_HEIGHT,
    marginTop: -1,
    opacity: 0.88,
  },
  inlineRoot: {
    position: "relative",
    zIndex: 30,
  },
  inlineDismiss: {
    position: "absolute",
    top: -800,
    right: -800,
    bottom: -800,
    left: -800,
    zIndex: 31,
  },
  inlineMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: MENU_GAP_INLINE,
    zIndex: 32,
    minWidth: 168,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.premiumPurpleMuted,
    backgroundColor: P.accentPinkSurface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    minWidth: 168,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.premiumPurpleMuted,
    backgroundColor: P.accentPinkSurface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.manageDivider,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemEdit: {
    backgroundColor: P.accentPurpleSoft,
  },
  menuItemDelete: {
    backgroundColor: P.dangerSoft,
  },
  menuItemPause: {
    backgroundColor: P.warningPeach,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
  },
  menuItemTextEdit: {
    color: P.accentPurpleText,
  },
  menuItemTextDelete: {
    color: P.dangerText,
  },
  menuItemTextPause: {
    color: P.warningBrownDeep,
  },
}));

export const useRaffleFeaturedSectionStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    gap: 8,
  },
  revealButtonPressable: {
    width: "100%",
  },
  revealButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.action,
  },
  revealButtonPressed: {
    opacity: 0.92,
  },
  revealButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
}));

export const useRaffleFeaturedCarouselStyles = createThemedStyles(() => ({
  viewport: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  singleSlide: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
}));

export const useFeaturedRaffleWinnerCardStyles = createThemedStyles((theme) => ({
  root: {
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSurface,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.successText,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceMuted,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));

export const RAFFLE_FEATURED_LAYOUT = {
  slideGap: 12,
} as const;
