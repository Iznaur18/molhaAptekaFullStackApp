import { StyleSheet } from "react-native";

import { RAFFLE_FEATURED_BANNER_CHROME as L } from "@izibuy/shared-lib";

import { HOME_FEED_SECTION_GAP } from "@/features/home-feed/lib/homeFeedSectionLayout";
import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const BANNER_BORDER_RADIUS = 20;
const VISUAL_RADIUS_TOP = 11;
const VISUAL_RADIUS_BOTTOM = 9.6;
const BADGE_INSET = 7;
const SOUND_BUTTON_INSET = 7;
const SOUND_BUTTON_SIZE = 32;
const VISUAL_CONTROL_SIZE = 28;
const VISUAL_CONTROL_INSET = 7;
const VISUAL_CONTROL_GAP = 4;
const BANNER_BOTTOM_MARGIN = HOME_FEED_SECTION_GAP;

/** Паритет с CuratedProductListCarousel section chrome на главной. */
const RAFFLE_SECTION_CARD_BORDER_RADIUS = 16;
const RAFFLE_SECTION_CARD_PADDING_HORIZONTAL = 12;
const RAFFLE_SECTION_CARD_PADDING_VERTICAL = 8;
const RAFFLE_SECTION_TITLE_MARGIN_BOTTOM = 10;
const RAFFLE_SECTION_TITLE_PADDING_X = 4;

export const useRaffleFeaturedBannerStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    marginBottom: BANNER_BOTTOM_MARGIN,
  },
  rootInCarousel: {
    marginBottom: 0,
  },
  inner: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    borderWidth: 0,
    borderRadius: BANNER_BORDER_RADIUS,
    overflow: "hidden",
    shadowColor: P.accentPurple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    backgroundColor: theme.colors.surface,
  },
  innerHasBackdrop: {
    backgroundColor: theme.colors.surface,
  },
  innerStacked: {
    flexDirection: "column",
    gap: L.stackedGridGap,
    paddingTop: L.innerPaddingTop,
    paddingHorizontal: L.innerPaddingHorizontal,
    paddingBottom: L.innerPaddingBottom,
  },
  innerSplit: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: L.splitGridGap,
    paddingHorizontal: L.innerPaddingHorizontal,
    paddingTop: L.innerPaddingTop,
    paddingBottom: L.innerPaddingBottom,
  },
  innerCompleted: {
    shadowColor: P.successVivid,
  },
  backdropSlot: {
    ...StyleSheet.absoluteFillObject,
    top: "-14%",
    bottom: "-14%",
    left: "-14%",
    right: "-14%",
    overflow: "hidden",
    zIndex: 0,
  },
  backdropMedia: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.82,
    transform: [{ scale: 1.06 }],
  },
  backdropScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface,
    zIndex: 0,
  },
  backdropScrimCompleted: {
    backgroundColor: theme.colors.surface,
  },
  visual: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
    zIndex: 1,
  },
  visualStacked: {
    alignSelf: "stretch",
    marginTop: -L.imageBleedTop,
    marginBottom: 0,
    marginHorizontal: -L.imageBleedHorizontal,
    borderTopLeftRadius: VISUAL_RADIUS_TOP,
    borderTopRightRadius: VISUAL_RADIUS_TOP,
    borderBottomLeftRadius: VISUAL_RADIUS_BOTTOM,
    borderBottomRightRadius: VISUAL_RADIUS_BOTTOM,
  },
  visualSplit: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    marginTop: -L.imageBleedTop,
    marginLeft: -L.innerPaddingHorizontal,
    marginBottom: -L.imageBleedTop,
    borderTopLeftRadius: VISUAL_RADIUS_TOP,
    borderTopRightRadius: VISUAL_RADIUS_TOP,
    borderBottomLeftRadius: VISUAL_RADIUS_BOTTOM,
    borderBottomRightRadius: VISUAL_RADIUS_BOTTOM,
  },
  mediaFrame: {
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  videoWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: P.black,
  },
  soundButton: {
    position: "absolute",
    right: SOUND_BUTTON_INSET,
    bottom: SOUND_BUTTON_INSET,
    width: SOUND_BUTTON_SIZE,
    height: SOUND_BUTTON_SIZE,
    borderRadius: SOUND_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 17, 0.55)",
  },
  badge: {
    position: "absolute",
    top: BADGE_INSET,
    left: BADGE_INSET,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: P.accentPurple,
  },
  badgeCompleted: {
    backgroundColor: P.successDeep,
  },
  badgeText: {
    color: P.onContrast,
    fontSize: 11,
    fontWeight: "700",
  },
  visualControls: {
    position: "absolute",
    top: VISUAL_CONTROL_INSET,
    right: VISUAL_CONTROL_INSET,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: VISUAL_CONTROL_GAP,
  },
  visualControlButton: {
    width: VISUAL_CONTROL_SIZE,
    height: VISUAL_CONTROL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: P.onContrast,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  infoToggleButton: {
    width: VISUAL_CONTROL_SIZE,
    height: VISUAL_CONTROL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderRadius: VISUAL_CONTROL_SIZE / 2,
    backgroundColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  infoToggleText: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 16,
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
  body: {
    minWidth: 0,
    paddingTop: L.bodyPaddingTop,
    gap: 0,
    zIndex: 1,
  },
  bodySplit: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  bodyStacked: {
    paddingTop: 0,
  },
  title: {
    marginBottom: L.titleMarginBottom,
    fontSize: 20,
    lineHeight: L.titleLineHeight,
    fontWeight: "700",
    color: theme.colors.text,
    flexShrink: 1,
  },
  description: {
    marginBottom: L.descriptionMarginBottom,
    fontSize: 14,
    lineHeight: L.descriptionLineHeight,
    color: theme.colors.text,
    opacity: 0.88,
  },
  copyOnBackdrop: {
    color: P.onContrast,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressWrap: {
    marginBottom: L.progressMarginBottom,
  },
  progressBar: {
    height: L.progressBarHeight,
    borderRadius: 999,
    backgroundColor: P.progressTrack,
    overflow: "hidden",
  },
  progressBarBackdrop: {
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  progressBarCompleted: {
    backgroundColor: P.progressTrackCompleted,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: P.accentPurple,
  },
  progressFillBackdrop: {
    backgroundColor: P.onContrast,
  },
  progressFillCompleted: {
    backgroundColor: P.successVivid,
  },
  progressLabel: {
    marginTop: L.progressLabelMarginTop,
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
    marginTop: "auto",
  },
  btnPrimary: {
    paddingVertical: 7.2,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: P.accentPurple,
  },
  btnPrimaryCompleted: {
    backgroundColor: P.successDeep,
  },
  btnPrimaryText: {
    fontSize: 13.6,
    fontWeight: "600",
    color: P.onContrast,
  },
  btnPrimaryTextCompleted: {
    color: P.onContrast,
  },
  btnInstagram: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.accentPink,
    backgroundColor: P.accentPinkSoft,
  },
  btnInstagramText: {
    fontSize: 14,
    fontWeight: "600",
    color: P.accentPinkDeep,
  },
  completedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: P.successDeep,
  },
}));

export const useRaffleManageActionsStyles = createThemedStyles(() => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    minHeight: 32,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnEdit: {
    borderColor: P.accentPurple,
    backgroundColor: P.accentPurpleSoft,
  },
  btnDelete: {
    borderColor: P.dangerAccent,
    backgroundColor: P.dangerSoft,
  },
  btnPause: {
    borderColor: P.warning,
    backgroundColor: P.warningPeach,
  },
  btnEditText: {
    fontSize: 14,
    fontWeight: "700",
    color: P.accentPurpleText,
  },
  btnDeleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: P.dangerText,
  },
  btnPauseText: {
    fontSize: 14,
    fontWeight: "700",
    color: P.warningBrownDeep,
  },
}));

export const useRaffleFeaturedBannerManageMenuStyles = createThemedStyles(() => ({
  toggle: {
    width: VISUAL_CONTROL_SIZE,
    height: VISUAL_CONTROL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: P.onContrast,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleOpen: {
    backgroundColor: P.accentPurple,
  },
  toggleDisabled: {
    opacity: 0.55,
  },
  toggleText: {
    color: P.onContrast,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: -2,
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
    shadowColor: "#000",
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

export const useRaffleDescriptionModalStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: P.overlayMidnight,
  },
  dialog: {
    width: "100%",
    maxWidth: 512,
    maxHeight: "80%",
    borderWidth: 2,
    borderColor: P.premiumPurpleMuted,
    borderRadius: 16,
    backgroundColor: P.accentPinkSurface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
    shadowColor: P.accentPurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 38,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "700",
    color: P.accentPurpleText,
  },
  closeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: P.accentPurple,
    backgroundColor: P.accentPurpleSoft,
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: P.accentPurpleText,
  },
  raffleTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    color: theme.colors.text,
  },
  textScroll: {
    maxHeight: 280,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.text,
    opacity: 0.92,
  },
}));

export const useRaffleFeaturedSectionStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: HOME_FEED_SECTION_GAP,
  },
  sectionCard: {
    paddingHorizontal: RAFFLE_SECTION_CARD_PADDING_HORIZONTAL,
    paddingVertical: RAFFLE_SECTION_CARD_PADDING_VERTICAL,
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: RAFFLE_SECTION_CARD_BORDER_RADIUS,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: theme.colors.ink,
    marginBottom: RAFFLE_SECTION_TITLE_MARGIN_BOTTOM,
    paddingHorizontal: RAFFLE_SECTION_TITLE_PADDING_X,
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

export const RAFFLE_FEATURED_LAYOUT = {
  slideGap: 12,
} as const;
